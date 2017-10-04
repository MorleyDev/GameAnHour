import { Seconds } from "../../core/models/time.model";
import { physicsIntegrateComponent } from "./physics-integrate-object.func";
import { PhysicsObjectComponent } from "./physics-object.component";
import { PhysicsState } from "./physics.state";

export function physicsIntegrateState<TState extends PhysicsState>(state: TState, deltaTime: Seconds): TState {
	const physicsEntities = state.componentEntityLinks["PHYSICS_OBJECT"] || [];
	if (physicsEntities.length === 0) {
		return state;
	}
	return {
		...(state as any),
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
