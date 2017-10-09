import { main } from "../core/main";
import { createReduxApp } from "../functional/ReduxApp.function";
import { GameAction, GameState } from "./game-models";
import * as game from "./game-redux";

const app = createReduxApp<GameState, GameAction>(game.app);
const run = main(app);

if ((module as any).hot) {
	(window as any).app = run;
	(module as any).hot.accept(() => {
		run.hot(game.app);
	});
}
