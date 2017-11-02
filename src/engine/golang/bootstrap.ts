import "core-js";

import { bootstrap } from "../../main/game-bootstrap";
import { initialState } from "../../main/game-initial-state";
import { GameAction, GameState } from "../../main/game.model";

declare function GoEngine_PushState(state: GameState): void;
declare function GoEngine_PushAction(action: GameAction): void;

GoEngine_PushState(initialState);

bootstrap.subscribe(action => {
	GoEngine_PushAction(action);
});
