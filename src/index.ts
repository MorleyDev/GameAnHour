import "./core/extensions";
import "rxjs/add/operator/bufferCount";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

import { main } from "./core/main";
import { createReduxApp } from "./functional/ReduxApp.function";
import * as game from "./main/game";

const App = createReduxApp(game.app);
const app = main(App);

if ((module as any).hot) {
	(window as any).app = app;
	(module as any).hot.accept("./main/game", () => {
		const newGame: typeof game = require("./main/game");
		console.log("Accepting the new game-redux", newGame.app.initialState);
		app.hot(newGame.app);
	});
}
