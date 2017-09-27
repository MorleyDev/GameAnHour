import { RectangleType } from "../rectangle/rectangle.model.type";
import { add, multiply, normalise, subtract } from "../../maths/vector.maths";
import { Line2Type } from "../line/line.model.type";
import { Point2Type } from "../point/point.model.type";
import { is as isCircle } from "./circle.model.is";
import { is as isRectangle } from "../rectangle/rectangle.model.is";
import { lineToCircle as rectangleLineToCircle } from "../rectangle/rectangle.model.lineTo";
import { CircleType } from "./circle.model.type";

export function lineTo(lhs: CircleType, rhs: CircleType | RectangleType | Point2Type): Line2Type {
	if (isCircle(rhs)) {
		return lineToCircle(lhs, rhs);
	} else if (isRectangle(rhs)) {
		const [b, a] = rectangleLineToCircle(rhs, lhs);
		return [a, b];
	} else {
		return lineToPoint2(lhs, rhs);
	}
}

export function lineToPoint2(lhs: CircleType, rhs: Point2Type): Line2Type {
	const offset = subtract(rhs, lhs);
	const normalised = add(multiply(normalise(offset), lhs.radius), lhs);

	return [normalised, rhs];
}

export function lineToCircle(lhs: CircleType, rhs: CircleType): Line2Type {
	const offset = subtract(rhs, lhs);
	const n = normalise(offset);
	const l = add(multiply(n, lhs.radius), lhs);
	const r = subtract(rhs, multiply(n, rhs.radius));

	return [l, r];
}
