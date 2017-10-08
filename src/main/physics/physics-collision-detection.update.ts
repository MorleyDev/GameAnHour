import { Observable } from "rxjs/Observable";

import { intersect } from "../../core/extensions/Array.intersect.func";
import { Shape2 } from "../../core/models/shapes.model";
import { Seconds } from "../../core/models/time.model";
import { EntityId } from "../../entity-component/entity-base.type";
import { GenericAction } from "../../functional/generic.action";
import { PhysicsChangeActiveCollisionsAction } from "./physics-change-active-collisions.action";
import { PhysicsCollidableComponent } from "./physics-collidable.component";
import { PhysicsPhysicalComponent } from "./physics-physical.component";
import { PhysicsState } from "./physics-state";

const applyPhysicsCollisionDetectionToState = <TState extends PhysicsState>(state: TState): GenericAction[] => {
	if (!state.physics.collisions.enabled) {
		return [];
	}

	const targetEntityIds = state.componentEntityLinks.at("PHYS_PhysicsCollidableComponent");
	const targetEntities = Array.from( state.entities.subset(targetEntityIds).values() );

	let addedCollisions: [EntityId, EntityId][] = [];
	let removedCollisions: [EntityId, EntityId][] = [];
	for (let i = 0; i < targetEntities.length; ++i) {
		for (let j = i + 1; j < targetEntities.length; ++j) {
			const lhsEntity = targetEntities[i];
			const rhsEntity = targetEntities[j];
			const lhs = {
				physical: lhsEntity.components.at("PHYS_PhysicsPhysicalComponent") as PhysicsPhysicalComponent | undefined,
				collision: lhsEntity.components.at("PHYS_PhysicsCollidableComponent")! as PhysicsCollidableComponent
			};
			const rhs = {
				physical: rhsEntity.components.at("PHYS_PhysicsPhysicalComponent") as PhysicsPhysicalComponent | undefined,
				collision: rhsEntity.components.at("PHYS_PhysicsCollidableComponent")! as PhysicsCollidableComponent
			};

			const isLhsRest = lhs.physical == null || lhs.physical.properties.velocity.x === 0 && lhs.physical.properties.velocity.y === 0;
			const isRhsRest = rhs.physical == null || rhs.physical.properties.velocity.x === 0 && rhs.physical.properties.velocity.y === 0;
			if (isLhsRest && isRhsRest) {
				continue;
			}

			const rhsModel = rhs.physical == null
				? rhs.collision.properties.collision
				: Shape2.add(rhs.collision.properties.collision, rhs.physical.properties.position);
			const lhsModel = lhs.physical == null
				? lhs.collision.properties.collision
				: Shape2.add(lhs.collision.properties.collision, lhs.physical.properties.position);

			if (Shape2.collision(lhsModel, rhsModel)) {
				if (!state.physics.collisions.active.at(lhsEntity.id).includes(rhsEntity.id)) {
					addedCollisions.push([lhsEntity.id, rhsEntity.id]);
				}
			} else if (state.physics.collisions.active.at(lhsEntity.id).includes(rhsEntity.id)) {
				removedCollisions.push([lhsEntity.id, rhsEntity.id]);
			}
		}
	}

	return addedCollisions.length > 0 || removedCollisions.length > 0
		? [PhysicsChangeActiveCollisionsAction(addedCollisions, removedCollisions)]
		: [];
}

export const applyPhysicsCollisionDetection = <TState extends PhysicsState>(tick$: Observable<{ deltaTime: Seconds; state: TState }>): Observable<GenericAction> => {
	return tick$.mergeMap(tick => applyPhysicsCollisionDetectionToState(tick.state));
}
