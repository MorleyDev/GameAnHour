import { Bodies, Body, Vector } from "matter-js";

import { Vector2 } from "../../pauper/core/maths/vector.maths";
import { Circle } from "../../pauper/core/models/circle/circle.model";
import { Point2, Rectangle, Shape2 } from "../../pauper/core/models/shapes.model";
import { Shape2Type } from "../../pauper/core/models/shapes.model.type";
import { BaseComponent } from "../../pauper/entity-component/component-base.type";

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

const shapeToBody = (shape: Shape2Type): Body => {
	if (Array.isArray(shape)) {
		const centre = Shape2.getCentre(shape);
		return Bodies.fromVertices(centre.x, centre.y, [shape.map(({ x, y }) => Vector.create(x, y))], { isStatic: true, isSensor: true });
	} else if (Rectangle.is(shape)) {
		return Bodies.rectangle(shape.x + shape.width / 2, shape.y + shape.height / 2, shape.width, shape.height, { isStatic: true, isSensor: true });
	} else if (Circle.is(shape)) {
		return Bodies.circle(shape.x, shape.y, shape.radius, { isStatic: true });
	} else {
		throw new Error();
	}
};

// Cheating the immutability by exploiting the lack of laziness!
// ----------------------------------------------------------------

// Given value T, perform some sideEffect using that value and then return T
const sideEffect = <T>(seed: T, sideEffect: (value: T) => void): T => {
	return effectVar(seed, sideEffect(seed));
};

/* Allows for the value passed in to be retrieved and whatever side-effect causing values have been passed in to be evaluated and discarded */
const effectVar = <T, U>(value: T, ..._u: U[]): T => value;
