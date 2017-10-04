import { HashMultiMap } from "../../core/utility/hashmultimap";
import { PhysicsState } from "./physics.state";
import { GenericAction } from "../../functional/generic.action";
import { EntitiesState } from "../../entity-component/entities.state";
import { physicsIntegrateState } from "./physics-integrate-state.func";
import { PhysicsAction } from "./physics.actions";

export function physicsReducer<TState extends PhysicsState>(state: TState, action: GenericAction): TState {
	if (PhysicsAction.AdvancePhysicsAction(action)) {
		return physicsIntegrateState(state, action.deltaTime);
	} else if (PhysicsAction.ActiveCollisionsChangedAction(action)) {
		return {
			...(state as any),
			physics: {
				...state.physics,
				activeCollisions: HashMultiMap.fromBidirectPairs(action.detected, t => t.id)
			}
		}
	} else if (action.type === "PHYS_DEBUG_ToggleIntegrator") {
		return {
			...(state as any),
			physics: {
				...state.physics,
				integrationEnabled: !state.physics.integrationEnabled
			}
		}
	} else {
		return state;
	}
}
