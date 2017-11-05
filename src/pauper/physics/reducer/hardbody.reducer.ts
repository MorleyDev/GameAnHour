import { createEntityReducer } from "../../ecs/create-entity-reducer.func";
import { Vector2 } from "../../maths/vector.maths";
import { HardBodyComponent } from "../component/HardBodyComponent";

export const hardBodyPreReducer = (applyForce: (c: HardBodyComponent, location: Vector2, force: Vector2) => void) => createEntityReducer(["HardBodyComponent"], (state, action, hardbody: HardBodyComponent) => {
	if (hardbody.pendingForces.length === 0) {
		return [hardbody];
	}

	hardbody.pendingForces.forEach(({ location, force }) => applyForce(hardbody, location, force));
	return [{
		...hardbody,
		pendingForces: []
	}];
});

export const hardBodyPostReducer = (sync: (c: HardBodyComponent) => HardBodyComponent) => createEntityReducer(["HardBodyComponent"], (state, action, hb: HardBodyComponent) => {
	const hardbody = sync(hb);
	return [{
		...hardbody,
		restingTime: hardbody.isResting ? hardbody.restingTime + action.deltaTime : 0
	}];
});
