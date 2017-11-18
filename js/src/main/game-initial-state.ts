import { pipe } from "rxjs/util/pipe";

import { EntitiesState } from "../pauper/ecs/entities.state";
import { GameState } from "./game.model";

export const initialState: GameState = pipe(
	() => ({ effects: [], runtime: 0 }),
	EntitiesState
)({});
