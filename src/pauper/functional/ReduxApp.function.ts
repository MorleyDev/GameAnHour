import { applyMiddleware, compose as productionCompose, createStore } from "redux";
import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { merge } from "rxjs/observable/merge";
import { of as of$ } from "rxjs/observable/of";
import { Observer } from "rxjs/Observer";
import { scan } from "rxjs/operators/scan";
import { share } from "rxjs/operators/share";
import { Subject } from "rxjs/Subject";

import { profile } from "../core/profiler";
import { GenericAction } from "./generic.action";
import { ReduxApp } from "./ReduxApp.type";
import { SystemState } from "./system.state";

export function createReduxApp<
	TState extends Partial<SystemState>,
	TAction extends GenericAction = GenericAction
	>(app: ReduxApp<TState, TAction>): Observable<TState> {
	const devCompose: typeof productionCompose | undefined = typeof window !== "undefined" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
	const compose = devCompose || productionCompose;

	const storeBackedScan = (scanner: (state: TState, action: TAction) => TState, initial: TState): (input: Observable<TAction>) => Observable<TState> => {
		const store = createStore(scanner as any, initial, compose(applyMiddleware()));

		return self => self.pipe(
			scan((state: TState, action: TAction): TState => profile(action.type, () => {
				store.dispatch(action as any);
				return store.getState();
			}), initial));
	};
	const fastScan = scan;

	const reduxScan = process && process.env && process.env["NODE_ENV"] === "Production"
		? fastScan
		: storeBackedScan;

	const actions$ = merge(of$({ type: "@@INIT" }), app.bootstrap || empty()).pipe(share()) as Observable<TAction>;

	return merge(actions$, app.epic(actions$)).pipe(
		reduxScan((state: TState, action: TAction) => app.reducer(state, action), app.initialState)
	);
}

function selfFeeding<T>(set: (o$: Observable<T>) => Observable<T>): (self: Observable<T>) => Observable<T> {
	return bootstrap$ => {
		return Observable.create((observer: Observer<T>) => {
			const subject = new Subject<T>();
			const boot = bootstrap$
				.subscribe(bootstrap => {
					subject.next(bootstrap);
					observer.next(bootstrap);
				}, err => observer.error(err), () => observer.complete());

			const followUps = set(subject).subscribe(observer);

			return () => {
				boot.unsubscribe();
				followUps.unsubscribe();
			};
		});
	};
}
