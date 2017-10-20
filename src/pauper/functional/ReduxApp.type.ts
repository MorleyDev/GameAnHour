import { Observable } from "rxjs/Observable";

import { Seconds } from "../core/models/time.model";
import { FrameCollection } from "./render-frame.model";

export type ReduxApp<TState, TAction> = {
	readonly initialState: TState;
	readonly bootstrap: Observable<TAction>;
	readonly reducer: (prev: TState, curr: TAction) => TState;
	readonly postprocess: (prev: TState) => ({ readonly state: TState; readonly actions: ReadonlyArray<TAction>; });
	readonly render: (state: TState) => FrameCollection;
	readonly epic: (action: Observable<TAction>) => Observable<TAction>;
};
