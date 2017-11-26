import { $$ } from "@morleydev/functional-pipe";

import { EntitiesState } from "@morleydev/pauper/ecs/entities.state";
import { GameState } from "./game.model";

export const initialState: GameState = $$({ })
	.$(() => ({ effects: [], score: 0, runtime: 0 }))
	.$(EntitiesState)
	.$$();
