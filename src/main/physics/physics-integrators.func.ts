import { Vector2 } from "../../core/maths/vector.maths";
import { createEntityReducer } from "../../entity-component/create-entity-reducer.func";
import { TickAction } from "../../functional/system-tick.action";
import { GameState } from "../game-models";
import { PhysicsPhysicalComponent } from "./physics-physical.component";

export const applyPhysicsIntegrator = createEntityReducer<GameState>(
	["PHYS_PhysicsPhysicalComponent"],
	(state: GameState, action: TickAction, physics: PhysicsPhysicalComponent) => {
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

export const applyPhysicsGravity = createEntityReducer<GameState>(
	["PHYS_PhysicsPhysicalComponent"],
	(state: GameState, action: TickAction, physics: PhysicsPhysicalComponent) => {
		return [{
			...physics,
			properties: {
				...physics.properties,
				velocity: Vector2.add(physics.properties.velocity, Vector2.multiply(state.physics.integrator.gravity, state.physics.integrator.scale * action.deltaTime)),
			}
		} as PhysicsPhysicalComponent];
	}
);
