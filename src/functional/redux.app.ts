import { List } from "immutable/dist/immutable-nonambient";
import * as redux from "redux";
import { ActionsObservable, combineEpics, createEpicMiddleware } from "redux-observable";
import { Observable } from "rxjs/Observable";

import { App } from "../core/App";
import { Renderer } from "../core/canvas/renderer.service";
import { EventHandler } from "../core/events/eventhandler.service";
import { KeyDown, KeyUp } from "./app.actions";
import { Frame } from "./frame.model";
import { Render } from "./render.function";

export function createReduxApp<TState, TAction extends redux.AnyAction>({ initialState, reducer, update, render, epics }: {
	initialState: TState,
	reducer: (prev: TState, curr: TAction) => TState,
	update: (state: TState, deltaTimeS: number) => redux.AnyAction[] | List<redux.AnyAction>,
	render: (state: TState) => Frame,
	epics: ((action: ActionsObservable<TAction>) => Observable<TAction>)[]
}): new (event: EventHandler) => App {
	return class implements App {
		private store = redux.createStore<TState>(
			reducer,
			initialState,
			safeApplyMiddleware(
				createEpicMiddleware(combineEpics(...epics))
			)
		);
	
		constructor(private events: EventHandler) {
			events.onKeyDown(key => this.store.dispatch({ type: KeyDown, key }));
			events.onKeyUp(key => this.store.dispatch({ type: KeyUp, key }));
		}
	
		update(deltaTimeS: number): void {
			const state = this.store.getState();
			const actions = update(state, deltaTimeS);
			Array.isArray(actions)
				? actions.forEach(action => { this.store.dispatch(action); })
				: actions.forEach(action => { this.store.dispatch(action); })
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
