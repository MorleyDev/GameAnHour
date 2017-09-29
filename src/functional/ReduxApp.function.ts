import { AnyAction, applyMiddleware, compose as productionCompose, createStore } from "redux";
import { combineEpics, createEpicMiddleware } from "redux-observable";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { Subject } from "rxjs/Subject";

import { App } from "../core/App";
import { EventHandler } from "../core/events/eventhandler.service";
import { Renderer } from "../core/graphics/renderer.service";
import { KeyDown, KeyUp } from "./app.actions";
import { Frame } from "./frame.model";
import { Render } from "./render.function";

export type ReduxApp<TState, TAction> = {
	initialState: TState;
	reducer: (prev: TState, curr: TAction) => TState;
	update: ((tick: Observable<[TState, number]>) => Observable<TAction>)[];
	render: (state: TState) => Frame;
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
			events.keyDown().subscribe(key => this.store.dispatch({ type: KeyDown, key }));
			events.keyUp().subscribe(key => this.store.dispatch({ type: KeyUp, key }));

			merge(...app.update.map(u => u(this.tick))).subscribe(value => this.store.dispatch(value));
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
