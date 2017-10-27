import { pipe } from "rxjs/util/pipe";

import { EntitiesState } from "../../ecs/entities.state";
import { GenericAction } from "../../redux/generic.action";
import { advancePhysics } from "../physics-driver";
import { PhysicsUpdateResult } from "../update.model";
import { hardBodyPostReducer, hardBodyPreReducer } from "./hardbody.reducer";

export const createPhysicsReducer = <TState extends EntitiesState>(onUpdate: (state: TState, result: PhysicsUpdateResult) => TState) => {
	return (state: TState, action: GenericAction): TState => {
		if (action.type !== "@@ADVANCE_PHYSICS") {
			return state;
		}
		return pipe(
			(state: TState) => hardBodyPreReducer(state, action) as TState,
			state => {
				const result = advancePhysics(action.deltaTime);
				return onUpdate(state, result);
			},
			state => hardBodyPostReducer(state, action) as TState
		)(state);
	};
};
