import { $$ } from "@morleydev/functional-pipe";
import { flatMap, map } from "@morleydev/functional-pipe/iterable/operators";

import { is as isCircle } from "../circle/circle.model.is";
import { lineCircleToTriangle2 } from "../circle/circle.model.lineTo";
import { is as isLine2 } from "../line/line.model.is";
import { findShortestLine, lineLine2ToLine2, lineLine2ToPoint2, lineLine2ToTriangle2 } from "../line/line.model.lineTo";
import { Line2Type } from "../line/line.model.type";
import { Point2Type } from "../point/point.model.type";
import { is as isRect } from "../rectangle/rectangle.model.is";
import { lineRectangleToTriangle } from "../rectangle/rectangle.model.lineTo";
import { Shape2Type } from "../shapes.model.type";
import { is as isTri2 } from "./triangle.model.is";
import { lines as linesOfTriangle } from "./triangle.model.lines";
import { Triangle2Type } from "./triangle.model.type";

export function lineTo(lhs: Triangle2Type, rhs: Shape2Type): Line2Type {
	if (isLine2(rhs)) {
		return flip(lineLine2ToTriangle2(rhs, lhs));
	} else if (isTri2(rhs)) {
		return lineTriangle2ToTriangle2(lhs, rhs);
	} else if (isCircle(rhs)) {
		return flip(lineCircleToTriangle2(rhs, lhs));
	} else if (isRect(rhs)) {
		return flip(lineRectangleToTriangle(rhs, lhs));
	} else {
		return lineTriangleToPoint2(lhs, rhs);
	}
}

const flip = <T>([a, b]: [T, T]): [T, T] => [b, a];

export function lineTriangle2ToTriangle2(lhs: Triangle2Type, rhs: Triangle2Type): Line2Type {
	const leftLines = linesOfTriangle(lhs);
	const rightLines = linesOfTriangle(rhs);

	return $$(leftLines)
		.$(flatMap((lline: Line2Type) => map((rline: Line2Type) => lineLine2ToLine2(lline, rline))(rightLines)))
		.$(findShortestLine)
		.$$();
}

export function lineTriangleToPoint2(lhs: Triangle2Type, rhs: Point2Type): Line2Type {
	return $$(lhs)
		.$(linesOfTriangle)
		.$(map(line => lineLine2ToPoint2(lhs, rhs)))
		.$(findShortestLine)
		.$$();
}
