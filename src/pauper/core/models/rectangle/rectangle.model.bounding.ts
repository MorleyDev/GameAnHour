import { bounding as point2Bounding, boundingTLBR as point2BoundingTLBR } from "../point/point.model.bounding";
import { Point2Type } from "../point/point.model.type";
import { RectangleType } from "./rectangle.model.type";

export function boundingTLBR(...rects: RectangleType[]): { readonly topLeft: Point2Type; readonly bottomRight: Point2Type } {
	return point2BoundingTLBR(
		...rects,
		...rects.map(rect => ({ x: rect.x + rect.width, y: rect.y + rect.height }))
	);
}

export function bounding(...rects: RectangleType[]): RectangleType {
	return point2Bounding(
		...rects,
		...rects.map(rect => ({ x: rect.x + rect.width, y: rect.y + rect.height }))
	);
}
