import { Seconds } from "../pauper/core/models/time.model";
import { EntitiesState } from "../pauper/entity-component";
import { EntityId } from "../pauper/entity-component/entity-base.type";
import { EntityComponentAction } from "../pauper/entity-component/entity-component.actions";
import { SystemState } from "../pauper/functional";

export type GameState
	= SystemState
	& EntitiesState
	& { readonly score: number }
	& { readonly effects: ReadonlyArray<GameAction>; readonly runtime: Seconds };

export type GameAction
	= { readonly type: "@@INIT" }
	| { readonly type: "@@TICK"; readonly deltaTime: Seconds }
	| { readonly type: "@@COLLISION_START"; readonly collision: { a: EntityId; b: EntityId } }
	| { readonly type: "@@COLLISION_END"; readonly collision: { a: EntityId; b: EntityId } }
	| { readonly type: "BALL_FINISHED"; readonly ball: EntityId }
	| { readonly type: "PlaySoundEffect"; readonly sound: string }
	| EntityComponentAction;
