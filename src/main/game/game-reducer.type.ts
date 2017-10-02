import { GameAction } from "./game-action.type";
import { GameState } from "./game-state.type";

export type GameReducer = (state: GameState, curr: GameAction) => GameState;
