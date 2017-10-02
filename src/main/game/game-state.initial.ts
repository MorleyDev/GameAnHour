import { EntitiesState } from "../ec/entities.state";
import { SystemState } from "../../functional/system.state";
import { GameState } from "./game-state.type";

export const initialState: GameState = { }
	.pipe(EntitiesState, [])
	.pipe(SystemState);
