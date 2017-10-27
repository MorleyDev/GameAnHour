import { Seconds } from "../../pauper/models/time.model";
import { Bodies, Body, Vector, World, IChamferableBodyDefinition } from "matter-js";

import { Radian } from "../../pauper/maths/angles.maths";
import { Vector2 } from "../../pauper/maths/vector.maths";
import { Circle } from "../../pauper/models/circle/circle.model";
import { Point2, Rectangle, Shape2 } from "../../pauper/models/shapes.model";
import { Shape2Type } from "../../pauper/models/shapes.model.type";
import { BaseComponent } from "../../pauper/ecs/component-base.type";
import { EntityId } from "../../pauper/ecs/entity-base.type";
import { engine } from "../physics-engine";

type PhysicsProperties = {
	readonly rotation: Radian;
	readonly velocity: Vector2;
	readonly angularVelocity: number;
	readonly elasticity: number;
	readonly density: number;
};

export type PhysicsComponent = BaseComponent<"PhysicsComponent", PhysicsProperties & {
	readonly shape: Shape2;
	readonly position: Point2;

	readonly restingTime: Seconds;
	readonly pendingForces: { location: Point2; force: Vector2 }[];

	readonly events: {
		connect(component: PhysicsComponent, entityId: EntityId): void;
		disconnect(component: PhysicsComponent, entityId: EntityId): void;
	};

	_body: Body | null;
}>;

const Recentre = (position: Point2, shape: Shape2) => {
	const centre = Shape2.getCentre(Shape2.add(shape, position));
	const offset = ( Vector2.subtract(position, centre) );
	return { position: centre, shape: Shape2.add(shape, offset) };
};

export const PhysicsComponent = (positionT: Point2, shapeT: Shape2, overloads?: Partial<PhysicsProperties>): PhysicsComponent => {
	const { position, shape } = Recentre(positionT, shapeT);
	return ({
		name: "PhysicsComponent",
		events: {
			connect: (component: PhysicsComponent, entityId: EntityId) => {
				component._body = shapeToBody(Shape2.add(component.shape, component.position), {
					restitution: component.elasticity,
					angularVelocity: component.angularVelocity,
					angle: component.rotation,
					velocity: component.velocity,
					position: component.position,
					density: component.density,
					name: entityId
				});
				return sideEffect(component, component => World.add(engine.world, component._body!));
			},
			disconnect: (component: PhysicsComponent, entityId: EntityId) => {
				return sideEffect(component, component => World.remove(engine.world, component._body!));
			}
		},
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

const shapeToBody = (shape: Shape2Type, props: IChamferableBodyDefinition & { readonly name: string }): Body => {
	if (Array.isArray(shape)) {
		const centre = Shape2.getCentre(shape);
		return Bodies.fromVertices(centre.x, centre.y, [shape.map(({ x, y }) => Vector.create(x, y))], props);
	} else if (Rectangle.is(shape)) {
		return Bodies.rectangle(shape.x + shape.width / 2, shape.y + shape.height / 2, shape.width, shape.height, props);
	} else if (Circle.is(shape)) {
		return Bodies.circle(shape.x, shape.y, shape.radius, props);
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
