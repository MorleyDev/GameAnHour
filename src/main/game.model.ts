import { Seconds } from "../pauper/core/models/time.model";
import { EntitiesState } from "../pauper/entity-component";
import { SystemState } from "../pauper/functional";

export type GameState
	= SystemState
	& EntitiesState
	& { readonly effects: ReadonlyArray<GameAction> };

export type GameAction
	= { readonly type: "@@TICK"; readonly deltaTime: Seconds };
