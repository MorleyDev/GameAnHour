import { matterJsPhysicsEngine } from "../_inner/matterEngine";
import { Bodies, Body, Vector, World } from "matter-js";

import { Vector2 } from "../../maths/vector.maths";
import { Circle } from "../../models/shapes.model";
import { Point2, Rectangle, Shape2 } from "../../models/shapes.model";
import { Shape2Type } from "../../models/shapes.model.type";
import { BaseComponent } from "../../ecs/component-base.type";
import { EntityId } from "../../ecs/entity-base.type";

export type StaticBodyComponent = BaseComponent<"StaticBodyComponent", {
	readonly position: Point2;
	readonly shape: Shape2;

	readonly events: {
		connect(component: StaticBodyComponent, entityId: EntityId): void;
		disconnect(component: StaticBodyComponent, entityId: EntityId): void;
	};

	_body: Body | null;
}>;

const Recentre = (position: Point2, shape: Shape2) => {
	const centre = Shape2.getCentre(Shape2.add(shape, position));
	const offset = ( Vector2.subtract(position, centre) );
	return { position: centre, shape: Shape2.add(shape, offset) };
};

export const StaticBodyComponent = (positionT: Point2, shapeT: Shape2): StaticBodyComponent => {
	const { position, shape } = Recentre(positionT, shapeT);
	return ({
		name: "StaticBodyComponent",
		events: {
			connect: (component: StaticBodyComponent, entityId: EntityId) => {
				component._body = shapeToBody(Shape2.add(component.shape, component.position));
				(component._body as any).name = entityId;
				return sideEffect(component, component => World.add(matterJsPhysicsEngine.world, component._body!));
			},
			disconnect: (component: StaticBodyComponent, entityId: EntityId) => {
				return sideEffect(component, component => World.remove(matterJsPhysicsEngine.world, component._body!));
			}
		},
		_body: null,
		shape,
		position
	});
};

const shapeToBody = (shape: Shape2Type): Body => {
	if (Array.isArray(shape)) {
		const centre = Shape2.getCentre(shape);
		return Bodies.fromVertices(centre.x, centre.y, [shape.map(({ x, y }) => Vector.create(x, y))], { isStatic: true });
	} else if (Rectangle.is(shape)) {
		return Bodies.rectangle(shape.x + shape.width / 2, shape.y + shape.height / 2, shape.width, shape.height, { isStatic: true });
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
