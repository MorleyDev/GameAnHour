import { bounding as point2Bounding, boundingTLBR as point2BoundingTLBR } from "../point/point.model.bounding";
import { Point2Type } from "../point/point.model.type";
import { RectangleType } from "./rectangle.model.type";

export function boundingTLBR(..._rects: RectangleType[]): { readonly topLeft: Point2Type; readonly bottomRight: Point2Type } {
	return point2BoundingTLBR(
		..._rects,
		..._rects.map(rect => ({ x: rect.x + rect.width, y: rect.y + rect.height }))
	);
}

export function bounding(..._rects: RectangleType[]): RectangleType {
	return point2Bounding(
		..._rects,
		..._rects.map(rect => ({ x: rect.x + rect.width, y: rect.y + rect.height }))
	);
}
