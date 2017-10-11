import { EntitiesState } from "../pauper/entity-component";
import { SystemState } from "../pauper/functional";
import { GameState } from "./game.model";

export const initialState: GameState = { }
	.pipe(SystemState)
	.pipe(EntitiesState());
