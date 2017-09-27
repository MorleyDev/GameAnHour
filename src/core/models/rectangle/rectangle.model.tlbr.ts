import { Point2Type } from "../point/point.model.type";
import { RectangleType } from "./rectangle.model.type";

export function getCentre(rectangle: RectangleType): Point2Type {
	return {
		x: rectangle.x + rectangle.width / 2,
		y: rectangle.y + rectangle.height / 2
	};
}

export function getTopLeft(rectangle: RectangleType): Point2Type {
	return {
		x: rectangle.x,
		y: rectangle.y
	};
}

export function getTopRight(rectangle: RectangleType): Point2Type {
	return {
		x: rectangle.x + rectangle.width,
		y: rectangle.y
	};
}
export function getBottomLeft(rectangle: RectangleType): Point2Type {
	return {
		x: rectangle.x,
		y: rectangle.y + rectangle.height
	};
}
export function getBottomRight(rectangle: RectangleType): Point2Type {
	return {
		x: rectangle.x + rectangle.width,
		y: rectangle.y + rectangle.height
	};
}

export function fromTopLeftBottomRight(tl: Point2Type, br: Point2Type): RectangleType {
	return {
		x: tl.x,
		y: tl.y,
		width: br.x - tl.x,
		height: br.y - tl.y
	};
}
