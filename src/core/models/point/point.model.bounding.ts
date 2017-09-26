import { RectangleType } from "../rectangle/rectangle.model.type";
import { getBottomRight, getTopLeft } from "./point.model.tlbr";
import { Point2Type } from "./point.model.type";

export function boundingTLBR(...points: Point2Type[]): { readonly topLeft: Point2Type; readonly bottomRight: Point2Type } {
	return {
		topLeft: getTopLeft(...points),
		bottomRight: getBottomRight(...points)
	};
}

export function bounding(...points: Point2Type[]): RectangleType {
	const { topLeft, bottomRight } = boundingTLBR(...points);

	return {
		x: topLeft.x,
		y: topLeft.y,
		width: bottomRight.x - topLeft.x,
		height: bottomRight.y - topLeft.y
	};
}
