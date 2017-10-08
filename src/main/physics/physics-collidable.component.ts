import { Shape2 } from "../../core/models/shapes.model";
import { BaseComponent } from "../../entity-component/component-base.type";

export type PhysicsCollidableComponent = BaseComponent & {
	readonly name: "PHYS_PhysicsCollidableComponent";
	readonly properties: {
		readonly collision: Shape2;
	};
};
export const PhysicsCollidableComponent = (collision: Shape2): PhysicsCollidableComponent => ({
	name: "PHYS_PhysicsCollidableComponent",
	properties: { collision }
});
