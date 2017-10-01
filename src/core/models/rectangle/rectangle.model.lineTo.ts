import { add, multiply, normalise, subtract } from "../../maths/vector.maths.func";
import { is as isCircle } from "../circle/circle.model.is";
import { CircleType } from "../circle/circle.model.type";
import { Line2Type } from "../line/line.model.type";
import { Point2Type } from "../point/point.model.type";
import { is as isRectangle } from "./rectangle.model.is";
import { getBottomLeft, getBottomRight, getCentre, getTopRight } from "./rectangle.model.tlbr";
import { RectangleType } from "./rectangle.model.type";

export function lineTo(lhs: RectangleType, rhs: RectangleType | CircleType | Point2Type): Line2Type {
	if (isCircle(rhs)) {
		return lineToCircle(lhs, rhs);
	} else if (isRectangle(rhs)) {
		return lineToRectangle(lhs, rhs);
	} else {
		return lineToPoint2(lhs, rhs);
	}
}

export function lineToRectangle(lhs: RectangleType, rhs: RectangleType): Line2Type {
	// WARNING: Does not produce the optimal solution

	const lhsCentre = getCentre(lhs);
	const rhsCentre = getCentre(rhs);

	const [lhsEdge] = lineTo(lhs, rhsCentre);
	const [rhsEdge] = lineTo(rhs, lhsCentre);

	return [lhsEdge, rhsEdge];
}

export function lineToCircle(lhs: RectangleType, rhs: CircleType): Line2Type {
	const [ pointOnRectangle, centreOfCircle ] = lineToPoint2(lhs, rhs);
	const vectorOfLine = subtract(pointOnRectangle, centreOfCircle);
	const normalisedLine = normalise(vectorOfLine);
	const lineOfRadiusLength = multiply(normalisedLine, rhs.radius);
	const pointOnCircle = add(lineOfRadiusLength, centreOfCircle );
	return [ pointOnRectangle, pointOnCircle ];
}

export function lineToPoint2(lhs: RectangleType, rhs: Point2Type): Line2Type {
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
