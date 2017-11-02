import { Body } from "matter-js";

import { BaseComponent } from "../../ecs/component-base.type";
import { Radian } from "../../maths/angles.maths";
import { Vector2 } from "../../maths/vector.maths";
import { Point2, Shape2 } from "../../models/shapes.model";
import { Seconds } from "../../models/time.model";

export type HardBodyProperties = {
	readonly rotation: Radian;
	readonly velocity: Vector2;
	readonly angularVelocity: number;
	readonly elasticity: number;
	readonly density: number;
};

export type HardBodyComponent = BaseComponent<"HardBodyComponent", HardBodyProperties & {
	readonly shape: Shape2;
	readonly position: Point2;

	readonly restingTime: Seconds;
	readonly pendingForces: { location: Point2; force: Vector2 }[];

	_body: Body | null;
}>;

const Recentre = (position: Point2, shape: Shape2) => {
	const centre = Shape2.getCentre(Shape2.add(shape, position));
	const offset = ( Vector2.subtract(position, centre) );
	return { position: centre, shape: Shape2.add(shape, offset) };
};

export const HardBodyComponent = (positionT: Point2, shapeT: Shape2, overloads?: Partial<HardBodyProperties>): HardBodyComponent => {
	const { position, shape } = Recentre(positionT, shapeT);
	return ({
		name: "HardBodyComponent",
		_body: null,
		shape,
		position,
		velocity: Vector2(0, 0),
		elasticity: 0,
		angularVelocity: 0,
		restingTime: 0,
		rotation: 0,
		pendingForces: [],
		density: 1,
		...overloads
	});
};
