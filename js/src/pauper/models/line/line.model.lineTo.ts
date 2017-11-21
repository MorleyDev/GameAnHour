import { $$ } from "@morleydev/functional-pipe";
import { fold, map } from "@morleydev/functional-pipe/iterable/operators";

import { add, divide, magnitudeSquared, multiply, normalise, subtract } from "../../maths/vector.maths.func";
import { is as isCircle } from "../circle/circle.model.is";
import { CircleType } from "../circle/circle.model.type";
import { Point2Type } from "../point/point.model.type";
import { is as isRect } from "../rectangle/rectangle.model.is";
import { lines } from "../rectangle/rectangle.model.lines";
import { RectangleType } from "../rectangle/rectangle.model.type";
import { Shape2Type } from "../shapes.model.type";
import { is as isTri2 } from "../triangle/triangle.model.is";
import { Triangle2Type } from "../triangle/triangle.model.type";
import { is as isLine2 } from "./line.model.is";
import { Line2Type } from "./line.model.type";

export function lineTo(lhs: Line2Type, rhs: Shape2Type): Line2Type {
	if (isLine2(rhs)) {
		return lineLine2ToLine2(lhs, rhs);
	} else if (isTri2(rhs)) {
		return lineLine2ToTriangle2(lhs, rhs);
	} else if (isCircle(rhs)) {
		return lineLine2ToCircle(lhs, rhs);
	} else if (isRect(rhs)) {
		return lineLine2ToRectangle(lhs, rhs);
	} else {
		return lineLine2ToPoint2(lhs, rhs);
	}
}

export function lineLine2ToTriangle2(lhs: Line2Type, rhs: Triangle2Type): Line2Type {
	return findShortestLine([
		lineLine2ToLine2(lhs, [rhs[0], rhs[1]]),
		lineLine2ToLine2(lhs, [rhs[1], rhs[0]]),
		lineLine2ToLine2(lhs, [rhs[2], rhs[0]])
	]);
}

export function findShortestLine(lines: Iterable<Line2Type>): Line2Type {
	return $$(lines)
		.$(map(line => ({ segment: line, length2: magnitudeSquared(subtract(line[1], line[0])) })))
		.$(fold((prev, curr) => prev.length2 < curr.length2 ? prev : curr))
		.$(line => line.segment)
		.$$();
}

export function lineLine2ToRectangle(lhs: Line2Type, rhs: RectangleType): Line2Type {
	const lineSet = lines(rhs);
	return findShortestLine([
		lineLine2ToLine2(lhs, lineSet.top),
		lineLine2ToLine2(lhs, lineSet.bottom),
		lineLine2ToLine2(lhs, lineSet.left),
		lineLine2ToLine2(lhs, lineSet.right)
	]);
}

export function lineLine2ToLine2(lhs: Line2Type, rhs: Line2Type): Line2Type {
	// TODO: lineTo Line2 -> Line2 not properly implemented, produces sub-optimal results
	return [getCentreOfLine(lhs), getCentreOfLine(rhs)];
}

export function lineLine2ToCircle(lhs: Line2Type, rhs: CircleType): Line2Type {
	const [l0] = lineLine2ToPoint2(lhs, rhs);
	const radius = rhs.radius;
	const lengthOfLine = subtract(rhs, l0);
	const angleOfLine = normalise(lengthOfLine);
	const radiusOfLine = multiply(angleOfLine, rhs.radius);
	const rhsPosition = add(rhs, radiusOfLine);
	return [l0, rhsPosition];
}

export function lineLine2ToPoint2(lhs: Line2Type, rhs: Point2Type): Line2Type {
	const a0 = rhs;
	const [a1, a2] = lhs;

	function magnitudeBetweenPointsSquared(v: Point2Type, w: Point2Type): number {
		return (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
	}

	const lengthSquaredOfLine = magnitudeBetweenPointsSquared(a1, a2);
	if (lengthSquaredOfLine === 0) {
		return [a1, a0];
	}

	const positionOnLine = ((a0.x - a1.x) * (a2.x - a1.x) + (a0.y - a1.y) * (a2.y - a1.y)) / lengthSquaredOfLine;
	if (positionOnLine < 0) {
		return [a1, a0];
	} else if (positionOnLine > 1) {
		return [a2, a0];
	} else {
		const pointOnLine = {
			x: a1.x + positionOnLine * (a2.x - a1.x),
			y: a1.y + positionOnLine * (a2.y - a1.y)
		};
		return [pointOnLine, a0];
	}
}

function getCentreOfLine(lhs: Line2Type): Point2Type {
	return add(lhs[0], divide(subtract(lhs[1], lhs[0]), 2));
}
