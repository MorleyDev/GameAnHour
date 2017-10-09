import { Shape2 } from "../../core/models/shapes.model";
import { HashMultiMap } from "../../core/utility/hashmultimap";
import { EntityId } from "../../entity-component/entity-base.type";
import { GameState } from "../game-models";
import { PhysicsCollidableComponent } from "./physics-collidable.component";
import { PhysicsActiveCollisionsDelta } from "./physics-collision-delta.model";
import { PhysicsPhysicalComponent } from "./physics-physical.component";
import { PhysicsState } from "./physics-state";

export const findPhysicsCollisionDetectionDelta = <TState extends PhysicsState>(state: TState): PhysicsActiveCollisionsDelta => {
	if (!state.physics.collisions.enabled) {
		return PhysicsActiveCollisionsDelta([], []);
	};

	const targetEntityIds = state.componentEntityLinks.at("PHYS_PhysicsCollidableComponent");
	const targetEntities = Array.from(state.entities.subset(targetEntityIds).values());

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
		? PhysicsActiveCollisionsDelta(addedCollisions, removedCollisions)
		: PhysicsActiveCollisionsDelta([], []);
};

export function applyCollisionDetectionDelta(state: GameState, delta: PhysicsActiveCollisionsDelta) {
	if (delta.active.length + delta.inactive.length === 0) {
		return state;
	}
	return ({
		...state,
		physics: {
			...state.physics,
			collisions: {
				...state.physics.collisions,
				active: state.physics.collisions.active
					.pipe(removeInactiveCollisions, delta.inactive)
					.pipe(appendActiveCollisions, delta.active)
			}
		}
	});
}

function removeInactiveCollisions(current: HashMultiMap<EntityId, EntityId>, inactiveSet: [EntityId, EntityId][]) {
	return inactiveSet.reduce((collisions, inactive) =>
		collisions
			.removeWhere(inactive[0], v => v === inactive[1])
			.removeWhere(inactive[1], v => v === inactive[0]), current
	);
}

function appendActiveCollisions(current: HashMultiMap<EntityId, EntityId>, activeSet: [EntityId, EntityId][]) {
	return activeSet.reduce((collisions, active) =>
		collisions
			.append(active[0], active[1])
			.append(active[1], active[0]), current
	);
}
