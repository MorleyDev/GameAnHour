import { EntitiesState } from "../pauper/entity-component/entities.state";
import { SystemState } from "../pauper/functional";
import { GameState } from "./game.model";

export const initialState: GameState = EntitiesState(SystemState({
	effects: []
}));
