import { applyMiddleware, compose as productionCompose, createStore, Store } from "redux";
import { combineEpics, createEpicMiddleware } from "redux-observable";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { distinctUntilChanged } from "rxjs/operator/distinctUntilChanged";
import { filter } from "rxjs/operator/filter";
import { map } from "rxjs/operator/map";
import { Subject } from "rxjs/Subject";

import { App } from "../core/App";
import { AppConstructor } from "../core/App.constructor";
import { EventHandler } from "../core/events/eventhandler.service";
import { fcall } from "../core/extensions/Object.fcall.func";
import { Renderer } from "../core/graphics/renderer.service";
import { Key } from "../core/models/keys.model";
import { Seconds } from "../core/models/time.model";
import { ReduxApp } from "./ReduxApp.type";
import { Render } from "./render-frame.function";
import { FrameCollection } from "./render-frame.model";
import { KeyDown } from "./system-keydown.action";
import { KeyUp } from "./system-keyup.action";

export function createReduxApp<
	TState,
	TAction
>(app: ReduxApp<TState, TAction>): AppConstructor {
	const devCompose: typeof productionCompose | undefined = typeof window !== "undefined" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
	const compose = devCompose || productionCompose;

	return class implements App {
		public readonly tick$: Subject<Seconds> = new Subject<Seconds>();
		public readonly state$: Subject<TState> = new Subject<TState>();
		public readonly render$: Subject<Renderer> = new Subject<Renderer>();

		public readonly store: Store<TState> = createStore<TState>(
			app.reducer as any,
			app.initialState,
			compose(applyMiddleware(createEpicMiddleware(combineEpics(...app.epics.map(epic => (action$: Observable<TAction>) => epic(action$, () => this.store.getState()))) as any), store => next => action => {
				const prevState: TState = store.getState() as any;
				const result = next(action);
				const nextState: TState = store.getState() as any;
				if (prevState !== nextState) {
					this.state$.next(nextState);
				}
				return result;
			}))
		);

		constructor(private events: EventHandler, private shutdown: () => void) {
			// Good lord this would be cleaned up by :: sooooooo much
			const keypresses$ = keyPresses(events.keyDown(), events.keyUp());
			const latest$tickState$ = fcall(this.tick$, map, (deltaTime: Seconds) => ({ state: this.store.getState(), deltaTime })) as Observable<{ state: TState; deltaTime: Seconds }>;
			const merged$actions$ = merge(...app.update.map(u => u(latest$tickState$)), keypresses$);

			const latest$render$state$ = fcall(this.render$, map, (renderer: Renderer) => [renderer, this.store.getState()]) as Observable<[Renderer, TState]>;
			const latest$render$frame$ = fcall(latest$render$state$, map, ([renderer, state]: [Renderer, TState]) => [renderer, app.render(state)]) as Observable<[Renderer, FrameCollection]>;

			const latest$state$ = fcall(this.state$, distinctUntilChanged);
			const latest$state$terminated = fcall(latest$state$, filter, (state: any) => state && state.system && state.system.terminate);

			const latest$render$frame$subscription = latest$render$frame$.subscribe(([render, frame]) => Render(render, frame));
			const merged$actions$subscription = merged$actions$.subscribe(action => this.store.dispatch(action as any));

			const latest$state$terminated$subscription = latest$state$terminated.subscribe(() => {
				shutdown();

				latest$render$frame$subscription.unsubscribe();
				merged$actions$subscription.unsubscribe();
				latest$state$terminated$subscription.unsubscribe();
			});
		}

		update(deltaTime: Seconds): void {
			this.tick$.next(deltaTime);
		}

		draw(canvas: Renderer): void {
			this.render$.next(canvas);
		}
	};
}

function keyPresses(keydown: Observable<Key>, keyup: Observable<Key>): Observable<KeyUp | KeyDown> {
	const keydown$ = fcall(keyup, map, (key: Key) => ({ type: 0, key }));
	const keyup$ = fcall(keyup, map, (key: Key) => ({ type: 1, key }));
	const merged$keyup$keydown$ = merge(keydown, keyup);
	const keypress$ = fcall(merged$keyup$keydown$, distinctUntilChanged, (a: { type: 0 | 1; key: Key }, b: { type: 0 | 1; key: Key }) => a.type === b.type && a.key === b.key);
	const keypress$actions$ = fcall(keypress$, map, (e: { type: 0 | 1; key: Key }) => e.type === 0 ? KeyDown(e.key) : KeyUp(e.key));

	return keypress$actions$ as Observable<KeyUp | KeyDown>;
}
