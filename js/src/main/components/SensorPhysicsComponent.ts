import { BaseComponent } from "../../pauper/ecs/component-base.type";
import { Vector2 } from "../../pauper/maths/vector.maths";
import { Point2, Shape2 } from "../../pauper/models/shapes.model";

export type SensorPhysicsComponent = BaseComponent<"SensorPhysicsComponent", {
	readonly shape: Shape2;
}>;

const Recentre = (position: Point2, shape: Shape2) => {
	const centre = Shape2.getCentre(Shape2.add(shape, position));
	const offset = ( Vector2.subtract(position, centre) );
	return { position: centre, shape: Shape2.add(shape, offset) };
};

export const SensorPhysicsComponent = (positionT: Point2, shapeT: Shape2): SensorPhysicsComponent => {
	const { position, shape } = Recentre(positionT, shapeT);
	return ({
		name: "SensorPhysicsComponent",
		shape: Shape2.add(shape, position)
	});
};
