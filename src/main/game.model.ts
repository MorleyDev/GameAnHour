import { SystemAction } from "../pauper/functional/system.action";
import { EntitiesState } from "../pauper/entity-component";
import { SystemState } from "../pauper/functional";

export type GameState
	= EntitiesState
	& SystemState
	& { };

export type GameAction
	= SystemAction;
