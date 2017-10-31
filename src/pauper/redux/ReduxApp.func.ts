import { applyMiddleware, compose as productionCompose, createStore } from "redux";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { of } from "rxjs/observable/of";
import { auditTime } from "rxjs/operators/auditTime";
import { distinctUntilChanged } from "rxjs/operators/distinctUntilChanged";
import { ignoreElements } from "rxjs/operators/ignoreElements";
import { map } from "rxjs/operators/map";
import { reduce } from "rxjs/operators/reduce";
import { scan } from "rxjs/operators/scan";
import { share } from "rxjs/operators/share";
import { switchMap } from "rxjs/operators/switchMap";
import { tap } from "rxjs/operators/tap";
import { Subject } from "rxjs/Subject";

import { AppDrivers, getGraphicsScheduler, getLogicalScheduler } from "../app-drivers";
import { profile } from "../profiler";
import { safeBufferTime } from "../rx-operators/safeBufferTime";
import { isProduction } from "../utility/is-production";
import { GenericAction } from "./generic.action";
import { ReduxApp } from "./ReduxApp.type";

export function createReduxApp<
	TState extends {},
	TAction extends GenericAction = GenericAction
	>(drivers: AppDrivers, app: ReduxApp<TState, TAction>): Observable<TState> {
	const devCompose: typeof productionCompose | undefined = typeof window !== "undefined" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
	const compose = devCompose || productionCompose;

	const logicalTickLimit = drivers.framerates != null && drivers.framerates.logicalTick != null ? drivers.framerates.logicalTick : 10;
	const logicalRenderLimit = drivers.framerates != null && drivers.framerates.logicalRender != null ? drivers.framerates.logicalRender : 10;

	const storeBackedScan: (reducer: (state: TState, action: TAction) => TState, initialState: TState) => (input: Observable<TAction>) => Observable<TState> =
		(reducer, initialState) => {
			const applyAction = (state: TState, action: TAction): TState => profile(action.type, () => sideEffect(store, store => store.dispatch(action as any)).getState());
			const applyActions = (state: TState, actions: ReadonlyArray<TAction>) => actions.reduce(applyAction, state);

			const store = createStore(reducer as any, initialState, compose(applyMiddleware()));
			return self => self.pipe(
				safeBufferTime(logicalTickLimit, getLogicalScheduler(drivers)),
				scan(applyActions, initialState),
				distinctUntilChanged()
			);
		};

	const fastScan: (reducer: (state: TState, action: TAction) => TState, initialState: TState) => (input: Observable<TAction>) => Observable<TState> =
		(reducer, initialState) => {
			const applyAction = (state: TState, action: TAction): TState => reducer(state, action);
			const applyActions = (state: TState, actions: ReadonlyArray<TAction>) => actions.reduce(applyAction, state);

			return input => input.pipe(
				safeBufferTime(logicalTickLimit, getLogicalScheduler(drivers)),
				scan(applyActions, initialState)
			);
		};

	const reduxScan = isProduction ? fastScan : storeBackedScan;

	const postProcessSubject = new Subject<TAction>();
	const subject = new Subject<TAction>();
	const epicActions$ = app.epic(merge(subject, postProcessSubject), drivers).pipe(
		tap(action => subject.next(action)),
		ignoreElements()
	);

	const applyAction = (state: TState, action: TAction): TState => {
		const nextState = app.reducer(state, action);
		const { state: newState, actions: followup } = app.postprocess(nextState);
		return followup
			.map(action => sideEffect(action, action => postProcessSubject.next(action)))
			.reduce(applyAction, newState);
	};
	const applyActions = (state: TState, actions: ReadonlyArray<TAction>) => actions.reduce(applyAction, state);

	return app.bootstrap.pipe(
		reduce((state: TState, action: TAction) => app.reducer(state, action), app.initialState),
		switchMap(state =>
			merge(epicActions$, subject, of({ type: "@@INIT" } as TAction)).pipe(
				reduxScan(applyAction, state)
			)
		),
	);
}

// Cheating the immutability by exploiting the lack of laziness!
// ----------------------------------------------------------------

// Given value T, perform some sideEffect using that value and then return T
const sideEffect = <T>(seed: T, sideEffect: (value: T) => void): T => {
	return effectVar(seed, sideEffect(seed));
};

/* Allows for the value passed in to be retrieved and whatever side-effect causing values have been passed in to be evaluated and discarded */
const effectVar = <T, U>(value: T, ..._u: U[]): T => value;

/* Allows for the result of executing value to be retrieved after whatever side-effect causing values have been passed in are evaluated */
const effect = <T, U>(value: () => T, ..._u: U[]): T => value();
