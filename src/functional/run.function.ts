import * as redux from "redux";

import { App } from "../core/App";
import { main } from "../core/main";
import { createReduxApp, ReduxApp } from "./ReduxApp.function";

export function run<TState, TAction extends redux.AnyAction>(app: ReduxApp<TState, TAction>): App {
	const runnable = createReduxApp<TState, TAction>(app);

	return main(runnable);
}
