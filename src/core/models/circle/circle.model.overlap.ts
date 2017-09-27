import { magnitudeSquared, subtract } from "../../maths/vector.maths";
import { lengthOf } from "../line/line.model.length";
import { Point2Type } from "../point/point.model.type";
import { is as isRectangle } from "../rectangle/rectangle.model.is";
import { RectangleType } from "../rectangle/rectangle.model.type";
import { is as isCircle } from "./circle.model.is";
import { lineTo } from "./circle.model.lineTo";
import { CircleType } from "./circle.model.type";

export function overlaps(lhs: CircleType, rhs: CircleType | RectangleType | Point2Type): boolean {
	if (isCircle(rhs)) {
		return overlapsCircle(lhs, rhs);
	} else if (isRectangle(rhs)) {
		return overlapsRectangle(lhs, rhs);
	} else {
		return overlapsPoint2(lhs, rhs);
	}
}

export function overlapsCircle(a: CircleType, b: CircleType): boolean {
	return magnitudeSquared(subtract(a, b)) <= (a.radius +  b.radius) * (a.radius +  b.radius);
}

export function overlapsPoint2(a: CircleType, b: Point2Type): boolean {
	return magnitudeSquared(subtract(a, b)) <= a.radius * a.radius;
}

export function overlapsRectangle(lhs: CircleType, rhs: RectangleType): boolean {
	return overlapsPoint2(lhs, rhs) || lengthOf( lineTo(lhs, rhs) ) <= lhs.radius;
}
