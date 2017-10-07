import { Triangle2Type } from "../triangle/triangle.model.type";
import { Line2Type } from "../line/line.model.type";
import { magnitudeSquared, subtract } from "../../maths/vector.maths.func";
import { intersectsCircle as lineIntersectsCircle } from "../line/line.model.intersect";
import { is as isLine } from "../line/line.model.is";
import { lengthOf } from "../line/line.model.length";
import { Point2Type } from "../point/point.model.type";
import { is as isRectangle } from "../rectangle/rectangle.model.is";
import { RectangleType } from "../rectangle/rectangle.model.type";
import { Shape2Type } from "../shapes.model.type";
import { is as isTri2 } from "../triangle/triangle.model.is";
import { overlapsCircle as triangleOverlapsCircle } from "../triangle/triangle.model.overlap";
import { is as isCircle } from "./circle.model.is";
import { lineTo } from "../rectangle/rectangle.model.lineTo";
import { CircleType } from "./circle.model.type";

export function overlaps(lhs: CircleType, rhs: Shape2Type): boolean {
	if (isLine(rhs)) {
		return overlapsLine2(lhs, rhs);
	} else if (isTri2(rhs)) {
		return overlapsTriangle2(lhs, rhs);
	} else if (isCircle(rhs)) {
		return overlapsCircle(lhs, rhs);
	} else if (isRectangle(rhs)) {
		return overlapsRectangle(lhs, rhs);
	} else {
		return overlapsPoint2(lhs, rhs);
	}
}

export function overlapsLine2(lhs: CircleType, rhs: Line2Type): boolean {
	return lineIntersectsCircle(rhs, lhs);
}

export function overlapsTriangle2(lhs: CircleType, rhs: Triangle2Type): boolean {
	return triangleOverlapsCircle(rhs, lhs);
}

export function overlapsCircle(a: CircleType, b: CircleType): boolean {
	return magnitudeSquared(subtract(a, b)) <= (a.radius +  b.radius) * (a.radius +  b.radius);
}

export function overlapsPoint2(a: CircleType, b: Point2Type): boolean {
	return magnitudeSquared(subtract(a, b)) <= a.radius * a.radius;
}

export function overlapsRectangle(lhs: CircleType, rhs: RectangleType): boolean {
	return overlapsPoint2(lhs, rhs) || ( lengthOf( lineTo(rhs, { x: lhs.x, y: lhs.y }) ) <= lhs.radius );
}
