import "./core/extensions";

import { run } from "./functional/run.function";
import { GameAction } from "./main/game/game-action.type";
import { gameEpic } from "./main/game/game-epic.func";
import { gameReducer } from "./main/game/game-reducer.func";
import { gameRender } from "./main/game/game-render.func";
import { initialState } from "./main/game/game-state.initial";
import { GameState } from "./main/game/game-state.type";
import { gameTick } from "./main/game/game-tick.func";

const app = run<GameState, GameAction>({
	initialState,
	update: [gameTick],
	reducer: gameReducer,
	render: gameRender,
	epics: [gameEpic]
});
