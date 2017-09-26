import "rxjs/add/observable/empty";
import "rxjs/add/observable/merge";
import "rxjs/add/operator/mergeMap";

import * as redux from "redux";
import { ActionsObservable, combineEpics, createEpicMiddleware } from "redux-observable";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

import { App } from "../core/App";
import { EventHandler } from "../core/events/eventhandler.service";
import { Renderer } from "../core/graphics/renderer.service";
import { KeyDown, KeyUp } from "./app.actions";
import { Frame } from "./frame.model";
import { Render } from "./render.function";

export function createReduxApp<TState, TAction extends redux.AnyAction>({ initialState, reducer, update, render, epics }: {
	initialState: TState;
	reducer: (prev: TState, curr: TAction) => TState;
	update: ((tick: Observable<[TState, number]>) => Observable<TAction>)[];
	render: (state: TState) => Frame;
	epics: ((action: ActionsObservable<TAction>) => Observable<TAction>)[];
}): new (event: EventHandler) => App {
	return class implements App {
		private readonly store = redux.createStore<TState>(
			reducer,
			initialState,
			safeApplyMiddleware(
				createEpicMiddleware(combineEpics(...epics))
			)
		);

		private tick = new Subject<[TState, number]>();

		constructor(private events: EventHandler) {
			events.onKeyDown(key => this.store.dispatch({ type: KeyDown, key }));
			events.onKeyUp(key => this.store.dispatch({ type: KeyUp, key }));

			Observable.merge(...update.map(u => u(this.tick))).subscribe(value => this.store.dispatch(value));
		}
	
		update(deltaTimeS: number): void {
			const state = this.store.getState();

			this.tick.next([state, deltaTimeS]);
		}
	
		draw(canvas: Renderer): void {
			const state = this.store.getState();
			const frame = render(state);
	
			Render(canvas, frame);
		}
	}
}

function safeApplyMiddleware(...middleware: redux.Middleware[]): redux.GenericStoreEnhancer {
	return ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || redux.compose)(redux.applyMiddleware(...middleware));
}
