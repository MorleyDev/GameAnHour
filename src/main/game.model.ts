import { Seconds } from "../pauper/core/models/time.model";
import { EntitiesState } from "../pauper/entity-component";
import { EntityComponentAction } from "../pauper/entity-component/entity-component.actions";
import { SystemState } from "../pauper/functional";
import { EntityId } from "../pauper/entity-component/entity-base.type";

export type GameState
	= SystemState
	& EntitiesState
	& { readonly effects: ReadonlyArray<GameAction> };

export type GameAction
	= { readonly type: "@@INIT" }
	| { readonly type: "@@TICK"; readonly deltaTime: Seconds }
	| { readonly type: "@@COLLISION_START"; readonly collision: { a: EntityId; b: EntityId } }
	| { readonly type: "@@COLLISION_END"; readonly collision: { a: EntityId; b: EntityId } }
	| EntityComponentAction;
