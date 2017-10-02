import * as redux from "redux";

import { App } from "../core/App";
import { main } from "../core/main";
import { createReduxApp } from "./ReduxApp.function";
import { ReduxApp } from "./ReduxApp.type";

export function run<TState, TAction extends redux.AnyAction>(app: ReduxApp<TState, TAction>): App {
	const runnable = createReduxApp<TState, TAction>(app);

	return main(runnable);
}
