import { add, multiply } from "../../core/maths/vector.maths.func";
import { Seconds } from "../../core/models/time.model";
import { PhysicsObjectComponent } from "./physics-object.component";

export function physicsIntegrateComponent(component: PhysicsObjectComponent, deltaTime: Seconds): PhysicsObjectComponent {
	return {
		...component,
		data: {
			position: add(component.data.position, multiply(component.data.velocity, deltaTime)),
			velocity: component.data.velocity
		}
	};
}
