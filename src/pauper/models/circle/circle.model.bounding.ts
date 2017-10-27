import { RectangleType } from "../rectangle/rectangle.model.type";
import { CircleType } from "./circle.model.type";

export function boundingBox(circle: CircleType): RectangleType {
	return {
		x: circle.x - circle.radius,
		y: circle.y - circle.radius,
		width: circle.radius * 2,
		height: circle.radius * 2
	};
}
