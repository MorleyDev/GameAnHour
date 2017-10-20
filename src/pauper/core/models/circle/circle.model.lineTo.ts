import { Triangle2Type } from "../triangle/triangle.model.type";
import { lineLine2ToCircle, lineLine2ToLine2, lineLine2ToPoint2 } from "../line/line.model.lineTo";
import { Shape2Type } from "../shapes.model.type";
import { RectangleType } from "../rectangle/rectangle.model.type";
import { add, multiply, normalise, subtract, magnitudeSquared } from "../../maths/vector.maths.func";
import { Line2Type } from "../line/line.model.type";
import { Point2Type } from "../point/point.model.type";
import { is as isCircle } from "./circle.model.is";
import { is as isLine2 } from "../line/line.model.is";
import { is as isTri2 } from "../triangle/triangle.model.is";
import { is as isRectangle } from "../rectangle/rectangle.model.is";
import { lineRectangleToCircle as rectangleLineToCircle } from "../rectangle/rectangle.model.lineTo";
import { CircleType } from "./circle.model.type";

export function lineTo(lhs: CircleType, rhs: Shape2Type): Line2Type {
	if (isLine2(rhs)) {
		const [b, a] = lineLine2ToCircle(rhs, lhs);
		return [a, b];
	} else if (isTri2(rhs)) {
		return lineCircleToTriangle2(lhs, rhs);
	} else if (isCircle(rhs)) {
		return lineCircleToCircle(lhs, rhs);
	} else if (isRectangle(rhs)) {
		const [b, a] = rectangleLineToCircle(rhs, lhs);
		return [a, b];
	} else {
		return lineCircleToPoint2(lhs, rhs);
	}
}

export function lineCircleToPoint2(lhs: CircleType, rhs: Point2Type): Line2Type {
	const offset = subtract(rhs, lhs);
	const normalised = add(multiply(normalise(offset), lhs.radius), lhs);

	return [normalised, rhs];
}

export function lineCircleToTriangle2(lhs: CircleType, rhs: Triangle2Type): Line2Type {
	return [lineLine2ToCircle([rhs[0], rhs[1]], lhs), lineLine2ToCircle([rhs[1], rhs[0]], lhs), lineLine2ToCircle([rhs[2], rhs[0]], lhs)]
		.map(([a, b]) => [b, a] as Line2Type)
		.map(line => ({
			segment: line,
			length2: magnitudeSquared(subtract(line[1], lhs))
		}))
		.reduce((prev, curr) => prev.length2 < curr.length2 ? prev : curr)
		.segment;
}

export function lineCircleToCircle(lhs: CircleType, rhs: CircleType): Line2Type {
	const offset = subtract(rhs, lhs);
	const n = normalise(offset);
	const l = add(multiply(n, lhs.radius), lhs);
	const r = subtract(rhs, multiply(n, rhs.radius));

	return [l, r];
}
