import { applyMiddleware, compose as productionCompose, createStore } from "redux";
import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { merge } from "rxjs/observable/merge";
import { ignoreElements } from "rxjs/operators/ignoreElements";
import { map } from "rxjs/operators/map";
import { scan } from "rxjs/operators/scan";
import { share } from "rxjs/operators/share";
import { tap } from "rxjs/operators/tap";
import { Subject } from "rxjs/Subject";

import { profile } from "../core/profiler";
import { AppDrivers } from "./app-drivers";
import { GenericAction } from "./generic.action";
import { ReduxApp } from "./ReduxApp.type";
import { SystemState } from "./system.state";

export function createReduxApp<
	TState extends Partial<SystemState>,
	TAction extends GenericAction = GenericAction
	>(drivers: AppDrivers, app: ReduxApp<TState, TAction>): Observable<TState> {
	const devCompose: typeof productionCompose | undefined = typeof window !== "undefined" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
	const compose = devCompose || productionCompose;

	const storeBackedScan = (scanner: (state: TState, action: TAction) => TState, initial: TState): (input: Observable<TAction>) => Observable<TState> => {
		const store = createStore(scanner as any, initial, compose(applyMiddleware()));

		return self => self.pipe(
			scan((state: TState, action: TAction): TState => profile(action.type, () => effect(() => store.getState(), store.dispatch(action as any))), initial)
		);
	};
	const fastScan = scan;

	const reduxScan = process && process.env && process.env["NODE_ENV"] === "Production"
		? fastScan
		: storeBackedScan;

	const subject = new Subject<TAction>();

	const state$ = merge(app.bootstrap || empty(), app.epic(subject, drivers)).pipe(
		tap(action => subject.next(action)),
		reduxScan((state: TState, action: TAction) => sideEffect(
			app.postprocess(app.reducer(state, action)),
			post => post.actions.forEach(action => subject.next(action))
		).state, app.initialState),
		share()
	);
	return merge(
		state$.pipe(
			map(state => app.render(state)),
			drivers.renderer,
			ignoreElements()
		) as Observable<TState>,
		state$
	);
}


// Cheating the immutability by exploiting the lack of laziness!
//----------------------------------------------------------------

// Given value T, perform some sideEffect using that value and then return T
const sideEffect = <T>(seed: T, sideEffect: (value: T) => void): T => {
	return effectVar(seed, sideEffect(seed));
}
/* Allows for the value passed in to be retrieved and whatever side-effect causing values have been passed in to be evaluated and discarded */
const effectVar = <T, U>(value: T, ..._u: U[]): T => value;

/* Allows for the result of executing value to be retrieved after whatever side-effect causing values have been passed in are evaluated */
const effect = <T, U>(value: () => T, ..._u: U[]): T => value();
