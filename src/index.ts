import "./core/extensions";

import { run } from "./functional/run.function";
import { GameAction } from "./game/GameAction";
import { GameState, initialState } from "./game/GameState";
import { mainReducer } from "./game/main.reducer";
import { mainRender } from "./game/main.render";
import { mainUpdateTicks } from "./game/main.updatetick";

const app = run<GameState, GameAction>({
	initialState,
	update: mainUpdateTicks,
	reducer: mainReducer,
	render: mainRender,
	epics: [
	]
});
