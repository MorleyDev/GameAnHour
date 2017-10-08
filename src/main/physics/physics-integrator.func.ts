import { Vector2 } from "../../core/maths/vector.maths";
import { createEntityReducer } from "../../entity-component/create-entity-reducer.func";
import { GenericAction } from "../../functional/generic.action";
import { GameState } from "../game-models";
import { PhysicsAdvanceIntegrationAction } from "./physics-advance-integration.action";
import { PhysicsPhysicalComponent } from "./physics-physical.component";

export const applyPhysicsIntegrator = createEntityReducer<GameState>(
	["PHYS_PhysicsPhysicalComponent"],
	(action: PhysicsAdvanceIntegrationAction, physics: PhysicsPhysicalComponent) => {
		if (physics.properties.velocity.x === 0 && physics.properties.velocity.y === 0) {
			return [physics];
		}
		return [{
			...physics,
			properties: {
				...physics.properties,
				position: Vector2.add(physics.properties.position, Vector2.multiply(physics.properties.velocity, action.deltaTime)),
			}
		} as PhysicsPhysicalComponent];
	}
);

export const applyPhysicsGravity = (state: GameState, action: PhysicsAdvanceIntegrationAction) => createEntityReducer<GameState>(
	["PHYS_PhysicsPhysicalComponent"],
	(action: PhysicsAdvanceIntegrationAction, physics: PhysicsPhysicalComponent) => {
		return [{
			...physics,
			properties: {
				...physics.properties,
				velocity: Vector2.add(physics.properties.velocity, Vector2.multiply(state.physics.integrator.gravity, action.deltaTime)),
			}
		} as PhysicsPhysicalComponent];
	}
)(state, action);
