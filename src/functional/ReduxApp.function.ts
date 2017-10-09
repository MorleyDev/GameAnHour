import { applyMiddleware, compose as productionCompose, createStore, Store } from "redux";
import { combineEpics, createEpicMiddleware } from "redux-observable";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { distinctUntilChanged } from "rxjs/operator/distinctUntilChanged";
import { switchMap } from "rxjs/operator/switchMap";
import { filter } from "rxjs/operator/filter";
import { map } from "rxjs/operator/map";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";

import { App } from "../core/App";
import { EventHandler } from "../core/events/eventhandler.service";
import { fcall } from "../core/extensions/Object.fcall.func";
import { Renderer } from "../core/graphics/renderer.service";
import { Key } from "../core/models/keys.model";
import { Seconds } from "../core/models/time.model";
import { ReduxApp } from "./ReduxApp.type";
import { Render } from "./render-frame.function";
import { FrameCollection } from "./render-frame.model";
import { KeyDownAction } from "./system-keydown.action";
import { KeyUpAction } from "./system-keyup.action";

export function createReduxApp<
	TState,
	TAction
>(appFactory: () => ReduxApp<TState, TAction>) {
	const devCompose: typeof productionCompose | undefined = typeof window !== "undefined" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
	const compose = devCompose || productionCompose;
	let app = appFactory();

	return class implements App {
		public readonly tick$: Subject<Seconds> = new Subject<Seconds>();
		public readonly state$: Subject<TState> = new Subject<TState>();
		public readonly render$: Subject<Renderer> = new Subject<Renderer>();

		public readonly store: Store<TState> = createStore<TState>(
			app.reducer as any,
			app.initialState,
			compose(applyMiddleware(createEpicMiddleware(combineEpics(action$ => app.epic(action$ as any)) as any), store => next => action => {
				const prevState: TState = store.getState() as any;
				const result = next(action);
				const nextState: TState = store.getState() as any;
				if (prevState !== nextState) {
					this.state$.next(nextState);
				}
				return result;
			}))
		);

		public subscriptions: Subscription[] = [];

		public hot(appFactory: () => ReduxApp<TState, TAction>) {
			this.dispose();
			this.initialise(appFactory());
		}

		constructor(private events: EventHandler, private shutdown: () => void) {
			this.initialise(app);
		}

		initialise(app: ReduxApp<TState, TAction>) {
			this.store.replaceReducer(app.reducer as any);

			// Good lord this would be cleaned up by :: sooooooo much
			const keypresses$ = keyPresses(this.events.keyDown(), this.events.keyUp());

			const latest$tickState$ = fcall(this.state$, switchMap, (state: TState) => fcall(this.tick$, map, (deltaTime: Seconds) => ({ state, deltaTime })));
			const merged$actions$ = merge(app.update(latest$tickState$), keypresses$);

			const latest$render$state$ = fcall(this.state$, switchMap, (state: TState) => fcall(this.render$, map, (renderer: Renderer) => [renderer, state]) as Observable<[Renderer, TState]>);
			const latest$render$frame$ = fcall(latest$render$state$, map, ([renderer, state]: [Renderer, TState]) => [renderer, app.render(state)]) as Observable<[Renderer, FrameCollection]>;

			const latest$state$ = fcall(this.state$, distinctUntilChanged);
			const latest$state$terminated = fcall(latest$state$, filter, (state: any) => state && state.system && state.system.terminate);

			const latest$render$frame$subscription = latest$render$frame$.subscribe(([render, frame]) => Render(render, frame));
			const merged$actions$subscription = merged$actions$.subscribe(action => this.store.dispatch(action as any));

			const latest$state$terminated$subscription = latest$state$terminated.subscribe(() => {
				this.dispose();
				this.shutdown();
			});
			this.subscriptions = [
				latest$state$terminated$subscription,
				latest$render$frame$subscription,
				merged$actions$subscription,
				latest$state$terminated$subscription
			];

			this.state$.next(this.store.getState());
		}

		dispose(): void {
			this.subscriptions.forEach(subscription => subscription.unsubscribe());
			this.subscriptions = [];
		}

		update(deltaTime: Seconds): void {
			this.tick$.next(deltaTime);
		}

		draw(canvas: Renderer): void {
			this.render$.next(canvas);
		}
	};
}

function keyPresses(keydown: Observable<Key>, keyup: Observable<Key>): Observable<KeyUpAction | KeyDownAction> {
	const keydown$ = fcall(keydown, map, (key: Key) => ({ type: 0, key }));
	const keyup$ = fcall(keyup, map, (key: Key) => ({ type: 1, key }));
	const merged$keyup$keydown$ = merge(keydown$, keyup$);
	const keypress$ = fcall(merged$keyup$keydown$, distinctUntilChanged, (a: { type: 0 | 1; key: Key }, b: { type: 0 | 1; key: Key }) => a.type === b.type && a.key === b.key);
	const keypress$actions$ = fcall(keypress$, map, (e: { type: 0 | 1; key: Key }) => e.type === 0 ? KeyDownAction(e.key) : KeyUpAction(e.key));

	return keypress$actions$ as Observable<KeyUpAction | KeyDownAction>;
}
