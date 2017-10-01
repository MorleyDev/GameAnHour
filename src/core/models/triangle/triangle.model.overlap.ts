import { is as isCircle } from "../circle/circle.model.is";
import { CircleType } from "../circle/circle.model.type";
import { intersectsCircle, intersectsTriangle2 } from "../line/line.model.intersect";
import { is as isLine } from "../line/line.model.is";
import { Line2Type } from "../line/line.model.type";
import { Point2Type } from "../point/point.model.type";
import { is as isRect } from "../rectangle/rectangle.model.is";
import { lines as rectLines } from "../rectangle/rectangle.model.lines";
import { RectangleType } from "../rectangle/rectangle.model.type";
import { Shape2Type } from "../shapes.model.type";
import { is as isTri2 } from "./triangle.model.is";
import { lines } from "./triangle.model.lines";
import { Triangle2Type } from "./triangle.model.type";

export function overlaps(lhs: Triangle2Type, rhs: Shape2Type) {
	if (isTri2(rhs)) {
		return overlapsTriangle2(lhs, rhs);
	} else if (isLine(rhs)) {
		return overlapsLine2(lhs, rhs);
	} else if (isRect(rhs)) {
		return overlapsRectangle(lhs, rhs);
	} else if (isCircle(rhs)) {
		return overlapsCircle(lhs, rhs);
	} else {
		return overlapsPoint2(lhs, rhs);
	}
}

export function overlapsCircle(lhs: Triangle2Type, rhs: CircleType): boolean {
	if (overlapsPoint2(lhs, rhs)) {
		return true;
	}
	return lines(lhs).some(line => intersectsCircle(line, rhs));
}

export function overlapsRectangle(lhs: Triangle2Type, rhs: RectangleType) {
	const { bottom, top, left, right } = rectLines(rhs);
	const rectLineSet = [bottom, top, left, right];

	return rectLineSet.some(line => overlapsLine2(lhs, line));
}

export function overlapsTriangle2(lhs: Triangle2Type, rhs: Triangle2Type): boolean {
	if (overlapsPoint2(lhs, rhs[0]) || overlapsPoint2(lhs, rhs[1]) || overlapsPoint2(lhs, rhs[2])) {
		return true;
	}

	const lhsLines = lines(lhs);
	return lines(rhs).some(rhsLine => overlapsLine2(lhs, rhsLine));
}

export function overlapsLine2([v1, v2, v3]: Triangle2Type, [a, b]: Line2Type) {
	if (overlapsPoint2([v1, v2, v3], a) || overlapsPoint2([v1, v2, v3], b)) {
		return false;
	}

	return intersectsTriangle2([a, b], [v1, v2, v3]);
}

export function overlapsPoint2([v1, v2, v3]: Triangle2Type, rhs: Point2Type): boolean {
	const sign = (p1: Point2Type, p2: Point2Type, p3: Point2Type): number => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);

	const b1 = sign(rhs, v1, v2) < 0.0;
	const b2 = sign(rhs, v2, v3) < 0.0;
	const b3 = sign(rhs, v3, v1) < 0.0;
	return ((b1 == b2) && (b2 == b3));
}
