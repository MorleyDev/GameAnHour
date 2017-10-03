import "./core/extensions";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

import { run } from "./functional/run.function";
import { gameEpic, gameReducer, gameRender, gameTick, initialState } from "./main/game";

const app = run({
	initialState,
	update: [gameTick],
	reducer: gameReducer,
	render: gameRender,
	epics: [gameEpic]
});
if (typeof window !== "undefined") {
	(window as any).app = app;
}
