import { Shape2 } from "../../core/models/shapes.model";
import { EntityId } from "../ec/entity-base.type";
import { GameState } from "../game/game-state.type";
import { GameTick } from "../game/game-tick.type";
import { extractCollisionMap } from "./physics-extract.func";
import { CollisionDetectedAction } from "./physics.actions";

export const physicsCollisionTick: GameTick = tick$ => tick$
	.mergeMap(({ state, deltaTime }) => collisionDetectionPass(state))
	.map(collision => CollisionDetectedAction(collision[0], collision[1]));

function collisionDetectionPass(state: GameState): [EntityId, EntityId][] {
	const entities = state.componentEntityLinks["PHYSICS_COLLIDABLE"] || [];
	const collidables = entities
		.map(id => state.entities.at(id))
		.map(entity => ({
			id: entity.id,
			collision: extractCollisionMap(entity.components)
		}));

	const result: [EntityId, EntityId][] = []; // Ugh
	for(let i = 0; i < collidables.length; ++i) {
		for(let j = i + 1; j < collidables.length; ++j) {
			const lhs = collidables[i];
			const rhs = collidables[j];
			if (lhs.collision.some(l => rhs.collision.some(r => Shape2.collision(l, r)))) {
				result.push([lhs.id, rhs.id]);
			}
		}
	}
	return result;
}
