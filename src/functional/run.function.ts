import * as redux from "redux";

import { main } from "../core/main";
import { createReduxApp, ReduxApp } from "./ReduxApp.function";

export function run<TState, TAction extends redux.AnyAction>(app: ReduxApp<TState, TAction>): void {
	main(createReduxApp<TState, TAction>(app));
}
