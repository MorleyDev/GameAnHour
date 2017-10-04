import { Seconds } from "../../core/models/time.model";
import { physicsIntegrateComponent } from "./physics-integrate-object.func";
import { PhysicsObjectComponent } from "./physics-object.component";
import { PhysicsState } from "./physics.state";

export function physicsIntegrateState<TState extends PhysicsState>(state: TState, deltaTime: Seconds): TState {
	const physicsEntities = state.componentEntityLinks.at("PHYSICS_OBJECT") || [];
	if (physicsEntities.length === 0) {
		return state;
	}
	return {
		...(state as any),
		entities: physicsEntities.reduce((state, entity) => {
			return state.update(entity, entity => ({
				...entity,
				components: entity.components.update("PHYSICS_OBJECT", component => physicsIntegrateComponent(component as PhysicsObjectComponent, deltaTime))
			}));
		}, state.entities)
	};
}
