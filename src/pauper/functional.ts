import { hasValue, Just, match, None, withDefault } from "./functional/maybe";
import { Blit, Clear, Fill, Frame, Origin, Rotate, Scale, Stroke } from "./functional/render-frame.model";

export { SystemState } from "./functional/system.state";
export { createReduxApp } from "./functional/ReduxApp.function";
export { combineReducers } from "./functional/combine-reducers.func";
export { createReducer } from "./functional/create-reducer.func";

export const Maybe = { Just, None, match, hasValue, withDefault };
export const Render = { Blit, Clear, Fill, Frame, Origin, Rotate, Scale, Stroke };
