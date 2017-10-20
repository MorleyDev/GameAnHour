import { Triangle2Type } from "../triangle/triangle.model.type";
import { Line2Type } from "../line/line.model.type";
import { magnitudeSquared, subtract } from "../../maths/vector.maths.func";
import { line2IntersectsCircle as lineIntersectsCircle } from "../line/line.model.intersect";
import { is as isLine } from "../line/line.model.is";
import { lengthOf } from "../line/line.model.length";
import { Point2Type } from "../point/point.model.type";
import { is as isRectangle } from "../rectangle/rectangle.model.is";
import { RectangleType } from "../rectangle/rectangle.model.type";
import { Shape2Type } from "../shapes.model.type";
import { is as isTri2 } from "../triangle/triangle.model.is";
import { triangle2OverlapsCircle as triangleOverlapsCircle } from "../triangle/triangle.model.overlap";
import { is as isCircle } from "./circle.model.is";
import { lineTo } from "../rectangle/rectangle.model.lineTo";
import { CircleType } from "./circle.model.type";

export function overlaps(lhs: CircleType, rhs: Shape2Type): boolean {
	if (isLine(rhs)) {
		return circleOverlapsLine2(lhs, rhs);
	} else if (isTri2(rhs)) {
		return circleOverlapsTriangle2(lhs, rhs);
	} else if (isCircle(rhs)) {
		return circleOverlapsCircle(lhs, rhs);
	} else if (isRectangle(rhs)) {
		return circleOverlapsRectangle(lhs, rhs);
	} else {
		return circleOverlapsPoint2(lhs, rhs);
	}
}

export function circleOverlapsLine2(lhs: CircleType, rhs: Line2Type): boolean {
	return lineIntersectsCircle(rhs, lhs);
}

export function circleOverlapsTriangle2(lhs: CircleType, rhs: Triangle2Type): boolean {
	return triangleOverlapsCircle(rhs, lhs);
}

export function circleOverlapsCircle(a: CircleType, b: CircleType): boolean {
	return magnitudeSquared(subtract(a, b)) <= (a.radius +  b.radius) * (a.radius +  b.radius);
}

export function circleOverlapsPoint2(a: CircleType, b: Point2Type): boolean {
	return magnitudeSquared(subtract(a, b)) <= a.radius * a.radius;
}

export function circleOverlapsRectangle(lhs: CircleType, rhs: RectangleType): boolean {
	return circleOverlapsPoint2(lhs, rhs) || ( lengthOf( lineTo(rhs, { x: lhs.x, y: lhs.y }) ) <= lhs.radius );
}
