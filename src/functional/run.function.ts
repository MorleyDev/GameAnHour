import { App } from "../core/App";
import { main } from "../core/main";
import { createReduxApp } from "./ReduxApp.function";
import { ReduxApp } from "./ReduxApp.type";

export function run<TState, TAction>(app: ReduxApp<TState, TAction>): App {
	const runnable = createReduxApp<TState, TAction>(app);

	return main(runnable);
}
