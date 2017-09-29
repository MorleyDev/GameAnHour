import { AnyAction, applyMiddleware, compose as productionCompose, createStore } from "redux";
import { combineEpics, createEpicMiddleware } from "redux-observable";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { map } from "rxjs/operator/map";
import { distinctUntilChanged } from "rxjs/operator/distinctUntilChanged";
import { Subject } from "rxjs/Subject";

import { App } from "../core/App";
import { EventHandler } from "../core/events/eventhandler.service";
import { Renderer } from "../core/graphics/renderer.service";
import { Key } from "../core/models/keys.model";
import { KeyDown, KeyUp } from "./app.actions";
import { FrameCollection } from "./frame.model";
import { Render } from "./render.function";

export type ReduxApp<TState, TAction> = {
	initialState: TState;
	reducer: (prev: TState, curr: TAction) => TState;
	update: ((tick: Observable<[TState, number]>) => Observable<TAction>)[];
	render: (state: TState) => FrameCollection;
	epics: ((action: Observable<TAction>) => Observable<TAction>)[];
};

export function createReduxApp<TState, TAction extends AnyAction>(app: ReduxApp<TState, TAction>): new (event: EventHandler) => App {
	const devCompose: typeof productionCompose | undefined = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
	const compose = devCompose || productionCompose;

	return class implements App {
		private prevState: TState | undefined = undefined;
		private tick: Subject<[TState, number]> = new Subject<[TState, number]>();

		private readonly store = createStore<TState>(
			app.reducer,
			app.initialState,
			compose(applyMiddleware(createEpicMiddleware(combineEpics(...app.epics))))
		);

		constructor(private events: EventHandler) {
			merge(events.keyDown().fpipe(map, (key: Key) => ({ type: 0, key })), events.keyUp().fpipe(map, (key: Key) => ({ type: 1, key })))
				.fpipe(distinctUntilChanged, (a: { type: 0 | 1; key: Key }, b: { type: 0 | 1; key: Key }) => a.type === b.type && a.key === b.key)
				.fpipe(map, (e: { type: 0 | 1; key: Key }) => e.type === 0 ? KeyDown(e.key) : KeyUp(e.key))
				.subscribe((e: KeyDown | KeyUp) => this.store.dispatch(e));

			merge( ...app.update.map(u => u(this.tick)) ).subscribe(value => this.store.dispatch(value));
		}

		update(deltaTimeS: number): void {
			const state = this.store.getState();

			this.tick.next([state, deltaTimeS]);
		}

		draw(canvas: Renderer): void {
			const state = this.store.getState();
			if (state === this.prevState) {
				return;
			}

			this.prevState = state;
			const frame = app.render(state);
			Render(canvas, frame);
		}
	};
}
