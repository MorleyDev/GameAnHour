import { _, match } from "../functional/pattern-match.function";
import { GameAction } from "./GameAction";
import { GameState } from "./GameState";

export const mainReducer = (state: GameState, curr: GameAction): GameState => match(curr, [
	[_, () => state]
]);
