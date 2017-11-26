import { EntitiesState } from "@morleydev/pauper/ecs/entities.state";
import { EntityId } from "@morleydev/pauper/ecs/entity-base.type";
import { EntityComponentAction } from "@morleydev/pauper/ecs/entity-component.actions";
import { Point2 } from "@morleydev/pauper/models/shapes.model";
import { Seconds } from "@morleydev/pauper/models/time.model";

export type GameState
	= EntitiesState
	& { readonly effects: ReadonlyArray<GameAction>; readonly runtime: Seconds };

export type PlayerTryJumpAction = { readonly type: "PlayerTryJumpAction"; readonly position: Point2 };

export type GameAction
	= { readonly type: "@@INIT" }
	| { readonly type: "@@TICK"; readonly deltaTime: Seconds }
	| { readonly type: "@@COLLISION_START"; readonly collision: { a: EntityId; b: EntityId } }
	| { readonly type: "@@COLLISION_END"; readonly collision: { a: EntityId; b: EntityId } }
	| { readonly type: "PlaySoundEffect"; readonly sound: string }
	| PlayerTryJumpAction
	| EntityComponentAction;
