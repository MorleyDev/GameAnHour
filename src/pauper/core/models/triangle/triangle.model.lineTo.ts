import { is as isLine2 } from "../line/line.model.is";
import { is as isTri2 } from "./triangle.model.is";
import { is as isRect } from "../rectangle/rectangle.model.is";
import { is as isCircle } from "../circle/circle.model.is";
import { Shape2Type } from "../shapes.model.type";
import { add, divide, subtract } from "../../maths/vector.maths.func";
import { Point2Type } from "../point/point.model.type";
import { Line2Type } from "../line/line.model.type";

export function lineTo(lhs: Line2Type, rhs: Shape2Type): Line2Type {
	if (isLine2(rhs)) {
		console.warn("lineTo Line2 -> Line2 not properly implemented");
		return lineToLine2(lhs, rhs);
	} else if (isTri2(rhs)) {
		console.warn("lineTo Line2 -> Triangle not properly implemented");
		return lineToLine2(lhs, rhs);
	} else if (isCircle(rhs)) {
		console.warn("lineTo Line2 -> Circle not properly implemented");
		return lineToPoint2(lhs, rhs);
	} else if (isRect(rhs)) {
		console.warn("lineTo Line2 -> Rect2 not properly implemented");
		return lineToPoint2(lhs, rhs);
	} else {
		console.warn("lineTo Line2 -> Point2 not properly implemented");
		return lineToPoint2(lhs, rhs);
	}
}

export function lineToLine2(lhs: Line2Type, rhs: Line2Type): Line2Type {
	return [getCentreOfLine(lhs), getCentreOfLine(rhs)];
}

export function lineToPoint2(lhs: Line2Type, rhs: Point2Type): Line2Type {
	return [getCentreOfLine(lhs), rhs];
}

function getCentreOfLine(lhs: Line2Type): Point2Type {
	return add(lhs[0], divide(subtract(lhs[1], lhs[0]), 2));
}
