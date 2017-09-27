import { Point2Type } from "../point/point.model.type";
import { RectangleType } from "./rectangle.model.type";

export function contains(a: RectangleType, point: Point2Type) {
	return point.x >= a.x && point.x <= a.x + a.width
	    && point.y >= a.y && point.y <= a.y + a.height;
}
