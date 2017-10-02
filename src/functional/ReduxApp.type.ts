import { Observable } from "rxjs/Observable";

import { Seconds } from "../core/models/time.model";
import { FrameCollection } from "./render-frame.model";

export type ReduxApp<TState, TAction> = {
	initialState: TState;
	reducer: (prev: TState, curr: TAction) => TState;
	update: ((tick: Observable<{ state: TState, deltaTime: Seconds }>) => Observable<TAction>)[];
	render: (state: TState) => FrameCollection;
	epics: ((action: Observable<TAction>) => Observable<TAction>)[];
};
