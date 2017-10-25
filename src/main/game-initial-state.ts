import { pipe } from "rxjs/util/pipe";

import { EntitiesState } from "../pauper/entity-component/entities.state";
import { SystemState } from "../pauper/functional";
import { GameState } from "./game.model";

export const initialState: GameState = pipe(
	() => ({ effects: [] }),
	SystemState,
	EntitiesState
)({});
