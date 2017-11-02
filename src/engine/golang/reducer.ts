import "core-js";

import { postprocess, reducer } from "../../main/game";
import { GameAction, GameState } from "../../main/game.model";

declare function GoEngine_SetReducer(callback: (state: GameState, action: GameAction) => GameState): void;
declare function GoEngine_PushAction(action: GameAction): void;

GoEngine_SetReducer((state: GameState, action: GameAction) => {
	const postProcess = postprocess(reducer(state, action));

	postProcess.actions.forEach(GoEngine_PushAction);
	return postProcess.state;
});
