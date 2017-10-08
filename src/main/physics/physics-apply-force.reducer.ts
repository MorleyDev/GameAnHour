import { Vector2 } from "../../core/maths/vector.maths";
import { GameState } from "../game-models";
import { PhysicsApplyForceAction } from "./physics-apply-force.action";
import { PhysicsPhysicalComponent } from "./physics-physical.component";

export const applyPhysicsForceReducer = (state: GameState, action: PhysicsApplyForceAction): GameState => ({
	...state,
	entities: state.entities.update(action.target, entity => ({
		...entity,
		components: entity.components.update("PHYS_PhysicsPhysicalComponent", (value: PhysicsPhysicalComponent) => ({
			...value,
			properties: {
				...value.properties,
				velocity: Vector2.add(value.properties.velocity, Vector2.divide(action.force, value.properties.mass))
			}
		} as PhysicsPhysicalComponent))
	}))
});
