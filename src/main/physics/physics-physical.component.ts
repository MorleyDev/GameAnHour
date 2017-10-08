import { Vector2 } from "../../core/maths/vector.maths";
import { Point2 } from "../../core/models/point/point.model";
import { BaseComponent } from "../../entity-component/component-base.type";

export type PhysicsPhysicalComponent = BaseComponent & {
	readonly name: "PHYS_PhysicsPhysicalComponent";
	readonly properties: {
		readonly position: Point2;
		readonly velocity: Vector2;
		readonly mass: number;
	};
};

export const PhysicsPhysicalComponent = (position: Point2, velocity: Vector2, mass: number): PhysicsPhysicalComponent => ({
	name: "PHYS_PhysicsPhysicalComponent",
	properties: { position, velocity, mass }
});