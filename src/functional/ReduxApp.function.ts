import { AnyAction, applyMiddleware, compose as productionCompose, createStore } from "redux";
import { combineEpics, createEpicMiddleware } from "redux-observable";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { distinctUntilChanged } from "rxjs/operator/distinctUntilChanged";
import { map } from "rxjs/operator/map";
import { Subject } from "rxjs/Subject";

import { App } from "../core/App";
import { EventHandler } from "../core/events/eventhandler.service";
import { Renderer } from "../core/graphics/renderer.service";
import { Key } from "../core/models/keys.model";
import { Seconds } from "../core/models/time.model";
import { KeyDown, KeyUp } from "./app.actions";
import { FrameCollection } from "./frame.model";
import { Render } from "./render.function";

export type ReduxApp<TState, TAction> = {
	initialState: TState;
	reducer: (prev: TState, curr: TAction) => TState;
	update: ((tick: Observable<{ state: TState, deltaTime: Seconds }>) => Observable<TAction>)[];
	render: (state: TState) => FrameCollection;
	epics: ((action: Observable<TAction>) => Observable<TAction>)[];
};

function keyPresses(keydown: Observable<Key>, keyup: Observable<Key>): Observable<KeyUp | KeyDown> {
	const keydown$ = map.call(keyup, (key: Key) => ({ type: 0, key }));
	const keyup$ = map.call(keyup, (key: Key) => ({ type: 1, key }));
	const keypresses = merge(keydown, keyup);
	const distinctKeyPresses = distinctUntilChanged.call(keypresses, (a: { type: 0 | 1; key: Key }, b: { type: 0 | 1; key: Key }) => a.type === b.type && a.key === b.key);
	const fullKeyPresses = map.call(distinctKeyPresses, (e: { type: 0 | 1; key: Key }) => e.type === 0 ? KeyDown(e.key) : KeyUp(e.key));

	return fullKeyPresses;
}

export function createReduxApp<TState, TAction extends AnyAction>(app: ReduxApp<TState, TAction>): new (event: EventHandler) => App {
	const devCompose: typeof productionCompose | undefined = typeof window !== "undefined" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
	const compose = devCompose || productionCompose;

	return class implements App {
		public readonly tick$: Subject<Seconds> = new Subject<Seconds>();
		public readonly state$: Subject<TState> = new Subject<TState>();
		public readonly render$: Subject<Renderer> = new Subject<Renderer>();

		public readonly store = createStore<TState>(
			app.reducer,
			app.initialState,
			compose(applyMiddleware(createEpicMiddleware(combineEpics(...app.epics)), store => next => action => {
				const result = next(action);
				const nextState: TState = store.getState() as any;
				this.state$.next(nextState);
				return result;
			}))
		);

		constructor(private events: EventHandler) {
			const keypresses$ = keyPresses(events.keyDown(), events.keyUp());
			const latest$tickState$: Observable<{ state: TState; deltaTime: Seconds }> = map.call(this.tick$, (deltaTime: Seconds) => ({ state: this.store.getState(), deltaTime }));
			const merged$actions$ = merge(...app.update.map(u => u(latest$tickState$)), keypresses$);

			const latest$render$state$: Observable<[Renderer, TState]> = map.call(this.render$, (renderer: Renderer) => [renderer, this.store.getState()]);
			const latest$render$frame$: Observable<[Renderer, FrameCollection]> = map.call(latest$render$state$, ([renderer, state]: [Renderer, TState]) => [renderer, app.render(state)]);

			merged$actions$.subscribe(action => this.store.dispatch(action));
			latest$render$frame$.subscribe(([render, frame]) => Render(render, frame));
		}

		update(deltaTime: Seconds): void {
			this.tick$.next(deltaTime);
		}

		draw(canvas: Renderer): void {
			this.render$.next(canvas);
		}
	};
}
