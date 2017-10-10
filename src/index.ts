import "./core/extensions";
import "rxjs/add/operator/bufferCount";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

import { main } from "./core/main";
import { createReduxApp } from "./functional/ReduxApp.function";
import { initialState } from "./main/game-initial-state";

const game: any = require("./main/game");
const App = createReduxApp({ ...game, initialState });
const app = main(App);
(window as any).app = app;

if ((module as any).hot) {
	(module as any).hot.accept("./main/game", () => {
		const newGame: typeof game = require("./main/game");
		console.log("Accepting the new game-redux");
		app.hot({ ...newGame });
	});
}
