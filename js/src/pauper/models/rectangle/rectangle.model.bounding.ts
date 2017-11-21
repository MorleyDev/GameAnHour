import { map } from "@morleydev/functional-pipe/iterable/operators";

import { bounding as point2Bounding, boundingTLBR as point2BoundingTLBR } from "../point/point.model.bounding";
import { Point2Type } from "../point/point.model.type";
import { RectangleType } from "./rectangle.model.type";

export function boundingTLBR(..._rects: RectangleType[]): { readonly topLeft: Point2Type; readonly bottomRight: Point2Type } {
	return point2BoundingTLBR(
		..._rects,
		...map((rect: RectangleType) => ({ x: rect.x + rect.width, y: rect.y + rect.height }))(_rects)
	);
}

export function bounding(..._rects: RectangleType[]): RectangleType {
	return point2Bounding(
		..._rects,
		...map((rect: RectangleType) => ({ x: rect.x + rect.width, y: rect.y + rect.height }))(_rects)
	);
}
