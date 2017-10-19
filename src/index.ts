import "./pauper/core/extensions";

import { bootstrap } from "./main/game-bootstrap";
import { initialState } from "./main/game-initial-state";
import { main } from "./pauper/core";
import { createReduxApp } from "./pauper/functional/ReduxApp.function";

const game: any = require("./main/game");

const App = createReduxApp({ ...game, initialState, bootstrap });
const app = main(App);

console.log("Running game");
if ((module as any).hot) {
	(window as any).app = app;
	(module as any).hot.accept("./main/game", () => {
		const newGame: typeof game = require("./main/game");
		console.log("Accepting the new game-redux");
		app.hot({ ...newGame });
	});
}
