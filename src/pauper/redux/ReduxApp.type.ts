import { Observable } from "rxjs/Observable";

import { AppDrivers } from "../app-drivers";
import { FrameCollection } from "../render/render-frame.model";

export type ReduxApp<TState, TAction> = {
	readonly initialState: TState;
	readonly bootstrap: Observable<TAction>;
	readonly reducer: (prev: TState, curr: TAction) => TState;
	readonly postprocess: (prev: TState) => ({ readonly state: TState; readonly actions: ReadonlyArray<TAction>; });
	readonly render: (state: TState) => FrameCollection;
	readonly epic: (action: Observable<TAction>, drivers: AppDrivers) => Observable<TAction>;
};
