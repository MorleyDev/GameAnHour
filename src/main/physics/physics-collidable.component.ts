import { Shape2 } from "../../core/models/shapes.model";
import { ValueComponent } from "../ec/component-value.type";

export type PhysicsCollidableComponent = ValueComponent<"PHYSICS_COLLIDABLE", {
	mesh: Shape2[];
}>;

export const PhysicsCollidableComponent = (mesh: Shape2[]): PhysicsCollidableComponent => ({
	name: "PHYSICS_COLLIDABLE",
	data: { mesh }
});
