import { EntitiesState } from "../../ecs/entities.state";
import { Vector2 } from "../../maths/vector.maths";
import { Seconds } from "../../models/time.model";
import { GenericAction } from "../../redux/generic.action";
import { HardBodyComponent } from "../component/HardBodyComponent";
import { PhysicsUpdateResult } from "../update.model";
import { hardBodyPostReducer, hardBodyPreReducer } from "./hardbody.reducer";
import { $$ } from "@morleydev/functional-pipe";

export const createPhysicsReducer = <TState extends EntitiesState>(
	advancePhysics: (deltaTime: Seconds) => PhysicsUpdateResult,
	syncComponent: (hardbody: HardBodyComponent) => HardBodyComponent,
	applyForce: (c: HardBodyComponent, location: Vector2, force: Vector2) => void
) => {
	return (onUpdate: (state: TState, result: PhysicsUpdateResult) => TState) =>
		(state: TState, action: GenericAction): TState => {
			if (action.type !== "@@ADVANCE_PHYSICS") {
				return state;
			}
			return $$(state)
				.$(state => hardBodyPreReducer(applyForce)(state, action) as TState)
				.$(state => onUpdate(state, advancePhysics(action.deltaTime)))
				.$(state => hardBodyPostReducer(syncComponent)(state, action) as TState)
				.$$();
		};
};
