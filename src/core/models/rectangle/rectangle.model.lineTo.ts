import { add, multiply, normalise, subtract } from "../../maths/vector.maths";
import { is as isCircle } from "../circle/circle.model.is";
import { CircleType } from "../circle/circle.model.type";
import { Line2Type } from "../line/line.model.type";
import { Point2Type } from "../point/point.model.type";
import { getBottomLeft, getBottomRight, getCentre, getTopRight } from "./rectangle.model.tlbr";
import { RectangleType } from "./rectangle.model.type";

export function lineTo(lhs: RectangleType, rhs: CircleType | Point2Type): Line2Type {
	if (isCircle(rhs)) {
		return lineToCircle(lhs, rhs);
	} else {
		return lineToPoint2(lhs, rhs);
	}
}

export function lineToCircle(lhs: RectangleType, rhs: CircleType): Line2Type {
	const lineToCentre = lineToPoint2(lhs, rhs);
	return [
		lineToCentre[0],
		add( multiply( normalise( subtract(lineToCentre[0], lineToCentre[1]) ), rhs.radius ), lineToCentre[1] )
	];
}

export function lineToPoint2(lhs: RectangleType, rhs: Point2Type): Line2Type {
	if (rhs.x < lhs.x) {
		if (rhs.y < lhs.y) {
			return [lhs, rhs];
		} else if (rhs.y > lhs.y + lhs.height) {
			return [getBottomLeft(lhs), rhs];
		} else {
			return [{ x: lhs.x, y: rhs.y }, rhs];
		}
	} else if (rhs.x > lhs.x + lhs.width) {
		if (rhs.y < lhs.y) {
			return [getTopRight(lhs), rhs];
		} else if (rhs.y > lhs.y + lhs.height) {
			return [getBottomRight(lhs), rhs];
		} else {
			return [{ x: lhs.x + lhs.width, y: rhs.y }, rhs];
		}
	} else if (rhs.y < lhs.y) {
		return [{ x: rhs.x, y: lhs.y }, rhs];
	} else if (rhs.y > lhs.y + lhs.height) {
		return [{ x: rhs.x, y: lhs.y + lhs.height }, rhs];
	} else {
		return [getCentre(lhs), rhs];
	}
}
