import { add, multiply, normalise, subtract } from "../../maths/vector.maths.func";
import { is as isCircle } from "../circle/circle.model.is";
import { CircleType } from "../circle/circle.model.type";
import { is as isLine2 } from "../line/line.model.is";
import { findShortestLine, lineLine2ToRectangle, lineLine2ToTriangle2 } from "../line/line.model.lineTo";
import { Line2Type } from "../line/line.model.type";
import { Point2Type } from "../point/point.model.type";
import { Shape2Type } from "../shapes.model.type";
import { is as isTri2 } from "../triangle/triangle.model.is";
import { Triangle2Type } from "../triangle/triangle.model.type";
import { is as isRectangle } from "./rectangle.model.is";
import { lines } from "./rectangle.model.lines";
import { getBottomLeft, getBottomRight, getCentre, getTopRight } from "./rectangle.model.tlbr";
import { RectangleType } from "./rectangle.model.type";

export function lineTo(lhs: RectangleType, rhs: Shape2Type): Line2Type {
	if (isLine2(rhs)) {
		const [b, a] = lineLine2ToRectangle(rhs, lhs);
		return [a, b];
	} else if (isTri2(rhs)) {
		return lineRectangleToTriangle(lhs, rhs);
	} else if (isCircle(rhs)) {
		return lineRectangleToCircle(lhs, rhs);
	} else if (isRectangle(rhs)) {
		return lineRectangleToRectangle(lhs, rhs);
	} else {
		return lineRectangleToPoint2(lhs, rhs);
	}
}

export function lineRectangleToTriangle(lhs: RectangleType, rhs: Triangle2Type): Line2Type {
	const { left, right, top, bottom } = lines(lhs);
	return findShortestLine([
		lineLine2ToTriangle2(left, rhs),
		lineLine2ToTriangle2(right, rhs),
		lineLine2ToTriangle2(top, rhs),
		lineLine2ToTriangle2(bottom, rhs)
	]);
}

export function lineRectangleToRectangle(lhs: RectangleType, rhs: RectangleType): Line2Type {
	// WARNING: Does not produce the optimal solution

	const lhsCentre = getCentre(lhs);
	const rhsCentre = getCentre(rhs);

	const [lhsEdge] = lineTo(lhs, rhsCentre);
	const [rhsEdge] = lineTo(rhs, lhsCentre);

	return [lhsEdge, rhsEdge];
}

export function lineRectangleToCircle(lhs: RectangleType, rhs: CircleType): Line2Type {
	const [pointOnRectangle, centreOfCircle] = lineRectangleToPoint2(lhs, rhs);
	const vectorOfLine = subtract(pointOnRectangle, centreOfCircle);
	const normalisedLine = normalise(vectorOfLine);
	const lineOfRadiusLength = multiply(normalisedLine, rhs.radius);
	const pointOnCircle = add(lineOfRadiusLength, centreOfCircle);

	return [pointOnRectangle, pointOnCircle];
}

export function lineRectangleToPoint2(lhs: RectangleType, rhs: Point2Type): Line2Type {
	if (rhs.x <= lhs.x) {
		if (rhs.y <= lhs.y) {
			return [lhs, rhs];
		} else if (rhs.y > lhs.y + lhs.height) {
			return [getBottomLeft(lhs), rhs];
		} else {
			return [{ x: lhs.x, y: rhs.y }, rhs];
		}
	} else if (rhs.x >= lhs.x + lhs.width) {
		if (rhs.y < lhs.y) {
			return [getTopRight(lhs), rhs];
		} else if (rhs.y > lhs.y + lhs.height) {
			return [getBottomRight(lhs), rhs];
		} else {
			return [{ x: lhs.x + lhs.width, y: rhs.y }, rhs];
		}
	} else if (rhs.y <= lhs.y) {
		return [{ x: rhs.x, y: lhs.y }, rhs];
	} else if (rhs.y >= lhs.y + lhs.height) {
		return [{ x: rhs.x, y: lhs.y + lhs.height }, rhs];
	} else {
		return [getCentre(lhs), rhs];
	}
}
