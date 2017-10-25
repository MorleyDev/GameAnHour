import { Seconds } from "../pauper/core/models/time.model";
import { EntitiesState } from "../pauper/entity-component";
import { EntityComponentAction } from "../pauper/entity-component/entity-component.actions";
import { SystemState } from "../pauper/functional";

export type GameState
	= SystemState
	& EntitiesState
	& { readonly effects: ReadonlyArray<GameAction> };

export type GameAction
	= { readonly type: "@@INIT" }
	| { readonly type: "@@TICK"; readonly deltaTime: Seconds }
	| {  readonly type: "DELETE_STATIC_BODIES" }
	| EntityComponentAction;
