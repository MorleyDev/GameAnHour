import { GenericAction } from "../../functional/generic.action";
import { EntitiesState } from "../../entity-component/entities.state";
import { physicsIntegrateState } from "./physics-integrate-state.func";
import { PhysicsAction } from "./physics.actions";

export function physicsReducer<TState extends EntitiesState>(state: TState, action: GenericAction): TState {
	if (PhysicsAction.AdvancePhysicsAction(action)) {
		return physicsIntegrateState(state, action.deltaTime);
	} else {
		return state;
	}
}
