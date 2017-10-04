import { Vector2 } from "../../core/maths/vector.maths";
import { add } from "../../core/maths/vector.maths.func";
import { ReducableComponent } from "../../entity-component/component-reducable.type";
import { ValueComponent } from "../../entity-component/component-value.type";
import { GenericAction } from "../../functional/generic.action";
import { PhysicsAction } from "./physics.actions";

export type PhysicsObjectComponent = ValueComponent<"PHYSICS_OBJECT", {
	position: Vector2;
	velocity: Vector2;
}> & ReducableComponent<"PHYSICS_OBJECT">;

export const PhysicsObjectComponent = (position: Vector2, velocity: Vector2): PhysicsObjectComponent => ({
	name: "PHYSICS_OBJECT",
	data: { position, velocity },
	reduce: (previous: PhysicsObjectComponent, action: GenericAction) => PhysicsAction.ApplyForceAction(action) ? ({
		...previous, data: {
			...previous.data,
			velocity: add(previous.data.velocity, action.force)
		}
	}) : previous
});
