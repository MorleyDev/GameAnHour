import { add, magnitudeSquared, multiply, normalise, subtract } from "../../maths/vector.maths.func";
import { is as isLine2 } from "../line/line.model.is";
import { lineLine2ToCircle } from "../line/line.model.lineTo";
import { Line2Type } from "../line/line.model.type";
import { Point2Type } from "../point/point.model.type";
import { is as isRectangle } from "../rectangle/rectangle.model.is";
import { lineRectangleToCircle as rectangleLineToCircle } from "../rectangle/rectangle.model.lineTo";
import { Shape2Type } from "../shapes.model.type";
import { is as isTri2 } from "../triangle/triangle.model.is";
import { Triangle2Type } from "../triangle/triangle.model.type";
import { is as isCircle } from "./circle.model.is";
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
	const a = lineLine2ToCircle([rhs[0], rhs[1]], lhs);
	const b = lineLine2ToCircle([rhs[1], rhs[0]], lhs);
	const c = lineLine2ToCircle([rhs[2], rhs[0]], lhs);
	const magA = magnitudeSquared(subtract(a[0], lhs));
	const magB = magnitudeSquared(subtract(b[0], lhs));
	const magC = magnitudeSquared(subtract(c[0], lhs));
	if (magA < magB) {
		return magA < magC ? a : c;
	} else {
		return magB < magC ? b : c;
	}
}

export function lineCircleToCircle(lhs: CircleType, rhs: CircleType): Line2Type {
	const offset = subtract(rhs, lhs);
	const n = normalise(offset);
	const l = add(multiply(n, lhs.radius), lhs);
	const r = subtract(rhs, multiply(n, rhs.radius));

	return [l, r];
}
