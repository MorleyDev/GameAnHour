import { HashMultiMap } from "../../core/utility/hashmultimap";
import { EntityId } from "../../entity-component/entity-base.type";
import { createReducer } from "../../functional/create-reducer.func";
import { GenericAction } from "../../functional/generic.action";
import { GameState } from "../game-models";
import { applyPhysicsForceReducer } from "./physics-apply-force.reducer";
import { PhysicsChangeActiveCollisionsAction } from "./physics-change-active-collisions.action";
import { applyPhysicsGravity, applyPhysicsIntegrator } from "./physics-integrator.func";

export const physicsIntegratorReducer = createReducer<GameState, GenericAction>(
	["PHYS_PhysicsAdvanceIntegrationAction", applyPhysicsIntegrator],
	["PHYS_PhysicsAdvanceIntegrationAction", applyPhysicsGravity],
	["PHYS_PhysicsApplyForceAction", applyPhysicsForceReducer],
	["PHYS_PhysicsChangeActiveCollisionsAction", (state, action: PhysicsChangeActiveCollisionsAction) => ({
		...state,
		physics: {
			...state.physics,
			collisions: {
				...state.physics.collisions,
				active: state.physics.collisions.active
					.pipe(removeInactiveCollisions, action.inactive)
					.pipe(appendActiveCollisions, action.active)
			}
		}
	})],
	[
		"PHYS_DEBUG_ToggleIntegrator", (state, action) => ({
			...state,
			physics: {
				...state.physics,
				integrator: {
					...state.physics.integrator,
					enabled: !state.physics.integrator.enabled
				}
			}
		})
	]
);

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
