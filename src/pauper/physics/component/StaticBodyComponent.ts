import { Bodies, Body, Vector, World } from "matter-js";

import { BaseComponent } from "../../ecs/component-base.type";
import { EntityId } from "../../ecs/entity-base.type";
import { Vector2 } from "../../maths/vector.maths";
import { Circle } from "../../models/shapes.model";
import { Point2, Rectangle, Shape2 } from "../../models/shapes.model";
import { Shape2Type } from "../../models/shapes.model.type";
import { matterJsPhysicsEngine } from "../_inner/matterEngine";

export type StaticBodyComponent = BaseComponent<"StaticBodyComponent", {
	readonly position: Point2;
	readonly shape: Shape2;
	_body: Body | null;
}>;

const Recentre = (position: Point2, shape: Shape2) => {
	const centre = Shape2.getCentre(Shape2.add(shape, position));
	const offset = (Vector2.subtract(position, centre));
	return { position: centre, shape: Shape2.add(shape, offset) };
};

export const StaticBodyComponent = (positionT: Point2, shapeT: Shape2): StaticBodyComponent => {
	const { position, shape } = Recentre(positionT, shapeT);
	return ({
		name: "StaticBodyComponent",
		_body: null,
		shape,
		position
	});
};
