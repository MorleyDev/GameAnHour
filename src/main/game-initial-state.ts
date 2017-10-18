import { EntitiesState } from "../pauper/entity-component";
import { SystemState } from "../pauper/functional";
import { GameState, GameStateFlag } from "./game.model";

export const initialState: GameState = { currentState: GameStateFlag.Initialising }
	.fpipe(EntitiesState)
	.fpipe(SystemState);
