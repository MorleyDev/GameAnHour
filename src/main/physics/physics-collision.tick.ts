import { EntityId } from "../../entity-component/entity-base.type";
import { HashMultiMap } from "../../core/utility/hashmultimap";
import { GenericAction } from "../../functional/generic.action";
import { Observable } from "rxjs/Observable";

import { Shape2 } from "../../core/models/shapes.model";
import { Seconds } from "../../core/models/time.model";
import { Entity } from "../../entity-component/entity.type";
import { extractCollisionMap } from "./physics-extract.func";
import { ActiveCollisionsChangedAction } from "./physics.actions";
import { PhysicsState } from "./physics.state";

export const physicsCollisionTick = (tick$: Observable<{ state: PhysicsState, deltaTime: Seconds }>) => tick$
	.map(({ state, deltaTime }) => collisionDetectionPass(state))
	.filter(collisions => collisions.ended.length + collisions.detected.length > 0)
	.map(({ detected, ended }) => ActiveCollisionsChangedAction(detected, ended));

function collisionDetectionPass(state: PhysicsState): { detected: [Entity, Entity][], ended: [Entity, Entity][] } {
	const entities = state.componentEntityLinks.at("PHYSICS_COLLIDABLE");
	const collidables = entities
		.map(id => state.entities.at(id)!)
		.map(entity => ({
			entity,
			collision: extractCollisionMap(entity.components)
		}));

	const oneOf = (lhs: Entity, rhs: Entity, possible: HashMultiMap<EntityId, Entity>) =>
		possible.at(lhs.id).some(e => e.id === rhs.id);

	const detected: [Entity, Entity][] = []; // Ugh
	const ended: [Entity, Entity][] = []; // Uuuugh
	for (let i = 0; i < collidables.length; ++i) {
		for (let j = i + 1; j < collidables.length; ++j) {
			const lhs = collidables[i];
			const rhs = collidables[j];
			if (lhs.collision.some(l => rhs.collision.some(r => Shape2.collision(l, r)))) {
				if (!oneOf(lhs.entity, rhs.entity, state.physics.activeCollisions)) {
					detected.push([lhs.entity, rhs.entity]);
				}
			} else if (oneOf(lhs.entity, rhs.entity, state.physics.activeCollisions)) {
				ended.push([lhs.entity, rhs.entity]);
			}
		}
	}
	return { detected, ended };
}
