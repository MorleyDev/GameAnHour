import { PhysicsObjectComponent } from "./physics-object.component";
import { physicsIntegrateComponent } from "./physics-integrate-object.func";
import { Seconds } from "../../core/models/time.model";
import { GameState } from "../game/game-state.type";

export function physicsIntegrateState(state: GameState, deltaTime: Seconds): GameState {
	const physicsEntities = state.componentEntityLinks["PHYSICS_OBJECT"] || [];
	if (physicsEntities.length === 0) {
		return state;
	}
	return {
		...state,
		entities: state.entities.updateWhere(
			([id]) => physicsEntities.includes(id),
			([_, entity]) => ({
				...entity,
				components: entity.components.map(component =>
					component.data != null && component.name === "PHYSICS_OBJECT"
						? physicsIntegrateComponent(component as PhysicsObjectComponent, deltaTime)
						: component
				)
			}))
	};
}
