import { createEntityReducer } from "../../ecs/create-entity-reducer.func";
import { HardBodyComponent } from "../component/HardBodyComponent";
import { Body } from "matter-js";


export const hardBodyPreReducer = createEntityReducer(["HardBodyComponent"], (state, action, hardbody: HardBodyComponent) => {
	if (hardbody.pendingForces.length === 0) {
		return [hardbody];
	}

	hardbody.pendingForces.forEach(({ location, force }) => Body.applyForce(hardbody._body!, location, force));
	return [{
		...hardbody,
		pendingForces: []
	}];
});

export const hardBodyPostReducer = createEntityReducer(["HardBodyComponent"], (state, action, hardbody: HardBodyComponent) => {
	const motion = hardbody._body!.speed * hardbody._body!.speed + hardbody._body!.angularSpeed * hardbody._body!.angularSpeed;
	const isResting = motion < 0.075;

	return [{
		...hardbody,
		restingTime: isResting ? hardbody.restingTime + action.deltaTime : 0,
		position: {
			x: hardbody._body!.position.x,
			y: hardbody._body!.position.y
		},
		velocity: {
			x: hardbody._body!.velocity.x,
			y: hardbody._body!.velocity.y,
		},
		angularVelocity: hardbody._body!.angularVelocity,
		rotation: hardbody._body!.angle
	}];
});
