import { Triangle2Type } from "../triangle/triangle.model.type";
import { is as isCircle } from "../circle/circle.model.is";
import { CircleType } from "../circle/circle.model.type";
import { intersectsRectangle as lineIntersectsRectangle } from "../line/line.model.intersect";
import { is as isLine2 } from "../line/line.model.is";
import { lengthOf } from "../line/line.model.length";
import { Line2Type } from "../line/line.model.type";
import { Point2Type } from "../point/point.model.type";
import { Shape2Type } from "../shapes.model.type";
import { is as isTri2 } from "../triangle/triangle.model.is";
import { overlapsRectangle as triangleOverlapsRectangle } from "../triangle/triangle.model.overlap";
import { is as isRect } from "./rectangle.model.is";
import { lineTo } from "./rectangle.model.lineTo";
import { RectangleType } from "./rectangle.model.type";

export function overlaps(lhs: RectangleType, rhs: Shape2Type): boolean {
	if (isLine2(rhs)) {
		return overlapsLine2(lhs, rhs);
	} else if (isTri2(rhs)) {
		return overlapsTriangle2(lhs, rhs);
	} else if (isRect(rhs)) {
		return overlapsRectangle(lhs, rhs);
	} else if (isCircle(rhs)) {
		return overlapsCircle(lhs, rhs);
	} else {
		return overlapsPoint2(lhs, rhs);
	}
}

export function overlapsLine2(lhs: RectangleType, rhs: Line2Type): boolean {
	if (overlapsPoint2(lhs, rhs[0]) || overlapsPoint2(lhs, rhs[1])) {
		return true;
	}
	return lineIntersectsRectangle(rhs, lhs);
}

export function overlapsTriangle2(lhs: RectangleType, rhs: Triangle2Type): boolean {
	return triangleOverlapsRectangle(rhs, lhs);
}

export function overlapsRectangle(lhs: RectangleType, rhs: RectangleType): boolean {
	return !(
		lhs.x > rhs.x + rhs.width
		|| lhs.y > rhs.y + rhs.height
		|| lhs.x + lhs.width < rhs.x
		|| lhs.y + lhs.height < rhs.y
	);
}

export function overlapsCircle(lhs: RectangleType, rhs: CircleType): boolean {
	return overlapsPoint2(lhs, rhs) || lengthOf(lineTo(lhs, { x: rhs.x, y: rhs.y })) <= rhs.radius;
}

export function overlapsPoint2(lhs: RectangleType, rhs: Point2Type) {
	return rhs.x >= lhs.x && rhs.x <= lhs.x + lhs.width && rhs.y >= lhs.y && rhs.y <= lhs.y + lhs.height;
}
