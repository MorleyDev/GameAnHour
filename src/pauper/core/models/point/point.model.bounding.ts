import { RectangleType } from "../rectangle/rectangle.model.type";
import { getBottomRight, getTopLeft } from "./point.model.tlbr";
import { Point2Type } from "./point.model.type";

export function boundingTLBR(..._points: Point2Type[]): { readonly topLeft: Point2Type; readonly bottomRight: Point2Type } {
	return {
		topLeft: getTopLeft(..._points),
		bottomRight: getBottomRight(..._points)
	};
}

export function bounding(..._points: Point2Type[]): RectangleType {
	const { topLeft, bottomRight } = boundingTLBR(..._points);

	return {
		x: topLeft.x,
		y: topLeft.y,
		width: bottomRight.x - topLeft.x,
		height: bottomRight.y - topLeft.y
	};
}
