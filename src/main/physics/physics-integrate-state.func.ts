import { Seconds } from "../../core/models/time.model";
import { EntitiesState } from "../../entity-component/entities.state";
import { physicsIntegrateComponent } from "./physics-integrate-object.func";
import { PhysicsObjectComponent } from "./physics-object.component";

export function physicsIntegrateState<TState extends EntitiesState>(state: TState, deltaTime: Seconds): TState {
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
