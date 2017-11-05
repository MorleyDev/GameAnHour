import { BaseComponent } from "../../ecs/component-base.type";
import { Vector2 } from "../../maths/vector.maths";
import { Point2, Shape2 } from "../../models/shapes.model";

export type StaticBodyComponent = BaseComponent<"StaticBodyComponent", {
	readonly position: Point2;
	readonly shape: Shape2;
	_body: any | null;
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
