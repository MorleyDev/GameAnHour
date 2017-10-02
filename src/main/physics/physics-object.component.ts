import { Vector2 } from "../../core/maths/vector.maths";
import { ValueComponent } from "../ec/component-value.type";

export type PhysicsObjectComponent = ValueComponent<"PHYSICS_OBJECT", {
	position: Vector2;
	velocity: Vector2;
}>;

export const PhysicsObjectComponent = (position: Vector2, velocity: Vector2): PhysicsObjectComponent => ({
	name: "PHYSICS_OBJECT",
	data: { position, velocity }
});
