import { lengthOf } from "../line/line.model.length";
import { lines as linesOfTriangle } from "./triangle.model.lines";
import { lineRectangleToTriangle } from "../rectangle/rectangle.model.lineTo";
import { lineCircleToTriangle2 } from "../circle/circle.model.lineTo";
import { lineLine2ToLine2, lineLine2ToPoint2, lineLine2ToTriangle2 } from "../line/line.model.lineTo";
import { add, divide, magnitudeSquared, subtract } from "../../maths/vector.maths.func";
import { is as isCircle } from "../circle/circle.model.is";
import { is as isLine2 } from "../line/line.model.is";
import { Line2Type } from "../line/line.model.type";
import { Point2Type } from "../point/point.model.type";
import { is as isRect } from "../rectangle/rectangle.model.is";
import { Shape2Type } from "../shapes.model.type";
import { is as isTri2 } from "./triangle.model.is";
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
	return leftLines.reduce((smallest, l) =>
		rightLines
			.map(r => lineLine2ToLine2(l, r))
			.reduce((smallest, line) => lengthOf(line) > lengthOf(smallest) ? smallest : line, smallest) // TODO: optimize to not recalculate length of smallest every cycle
	);
}

export function lineTriangleToPoint2(lhs: Triangle2Type, rhs: Point2Type): Line2Type {
	return linesOfTriangle(lhs)
		.map(line => lineLine2ToPoint2(lhs, rhs))
		.reduce((smallest, line) => {
			return lengthOf(line) > lengthOf(smallest) ? smallest : line;
		});
}
