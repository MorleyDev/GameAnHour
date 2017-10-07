import { Observable } from "rxjs/Observable";

import { App } from "../core/App";
import { Renderer } from "../core/graphics/renderer.service";
import { main } from "../core/main";
import { Seconds } from "../core/models/time.model";
import { createReduxApp } from "./ReduxApp.function";
import { FrameCollection } from "./render-frame.model";

export type ReduxApp<TState, TAction> = {
	initialState: TState;
	reducer: (prev: TState, curr: TAction) => TState;
	update: (tick: Observable<{ state: TState, deltaTime: Seconds }>) => Observable<TAction>;
	render: (state: TState) => FrameCollection;
	epic: (action: Observable<TAction>, state: () => TState) => Observable<TAction>;
};

export abstract class BaseReduxApp<TState, TAction> {
	constructor(...initialState: ((previousState: TState) => TState)[]) {
		const app = main(createReduxApp<TState, TAction>({
			epic: this.epic.bind(this),
			initialState: initialState.reduce((previousState: TState, reducer) => reducer(previousState), {} as TState),
			reducer: this.reducer.bind(this),
			render: this.render.bind(this),
			update: this.update.bind(this)
		}));

		if (typeof window !== "undefined") {
			(window as any).app = app;
		}
	}

	public abstract reducer(prev: TState, curr: TAction): TState;
	public abstract update(tick: Observable<{ state: TState, deltaTime: Seconds }>): Observable<TAction>;
	public abstract render(state: TState): FrameCollection;
	public abstract epic(action: Observable<TAction>, state: () => TState): Observable<TAction>;
}
