import { EntitiesState } from "../pauper/ecs/entities.state";
import { EntityId } from "../pauper/ecs/entity-base.type";
import { EntityComponentAction } from "../pauper/ecs/entity-component.actions";
import { Seconds } from "../pauper/models/time.model";

export type GameState
	= EntitiesState
	& { readonly effects: ReadonlyArray<GameAction>; readonly runtime: Seconds };

export type GameAction
	= { readonly type: "@@INIT" }
	| { readonly type: "@@TICK"; readonly deltaTime: Seconds }
	| { readonly type: "@@COLLISION_START"; readonly collision: { a: EntityId; b: EntityId } }
	| { readonly type: "@@COLLISION_END"; readonly collision: { a: EntityId; b: EntityId } }
	| { readonly type: "PlaySoundEffect"; readonly sound: string }
	| EntityComponentAction;
