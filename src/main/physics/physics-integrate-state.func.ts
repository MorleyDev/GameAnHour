import { PhysicsObjectComponent } from "./physics-object.component";
import { physicsIntegrateComponent } from "./physics-integrate-object.func";
import { Seconds } from "../../core/models/time.model";
import { GameState } from "../game/game-state.type";

export function physicsIntegrateState(state: GameState, deltaTime: Seconds): GameState {
	return {
		...state,
		entities: state.entities.map(entity => ({
			...entity,
			components: entity.components.map(component =>
				component.data != null && component.name === "PHYSICS_OBJECT"
					? physicsIntegrateComponent(component as PhysicsObjectComponent, deltaTime)
					: component
			)
		}))
	};
}
