import { Triangle2Type } from "../triangle/triangle.model.type";
import { magnitude, subtract } from "../../maths/vector.maths.func";
import { is as isCircle } from "../circle/circle.model.is";
import { CircleType } from "../circle/circle.model.type";
import { boundingTLBR } from "../point/point.model.bounding";
import { Point2Type } from "../point/point.model.type";
import { is as isRect } from "../rectangle/rectangle.model.is";
import { lines } from "../rectangle/rectangle.model.lines";
import { RectangleType } from "../rectangle/rectangle.model.type";
import { Shape2Type } from "../shapes.model.type";
import { is as isLine } from "./line.model.is";
import { is as isTri2 } from "../triangle/triangle.model.is";
import { Line2Type } from "./line.model.type";

export function intersects(lhs: Line2Type, rhs: Shape2Type, tolerance: number = 0.001): boolean {
	if (isLine(rhs)) {
		return intersectsLine2(lhs, rhs);
	} else if (isTri2(rhs)) {
		return intersectsTriangle2(lhs, rhs);
	} else if (isCircle(rhs)) {
		return intersectsCircle(lhs, rhs);
	} else if (isRect(rhs)) {
		return intersectsRectangle(lhs, rhs);
	} else {
		return intersectsPoint2(lhs, rhs, tolerance);
	}
}

export function intersectsTriangle2([a1, a2]: Line2Type, [v1, v2, v3]: Triangle2Type): boolean {
	return intersectsLine2([v1, v2], [a1, a2])
		|| intersectsLine2([v2, v3], [a1, a2])
		|| intersectsLine2([v3, v1], [a1, a2]);
}

export function intersectsCircle(lhs: Line2Type, rhs: CircleType): boolean {
	return intersectsPoint2(lhs, rhs, rhs.radius);
}

export function intersectsPoint2([a1, a2]: Line2Type, a0: Point2Type, tolerance: number): boolean {
	const top = Math.abs((a2.y - a1.y) * a0.x - (a2.x - a1.y) * a0.y + a2.x * a1.y - a2.y * a1.x)
	const bottom = magnitude(subtract(a2, a1));
	const distance = (top / bottom);

	return distance <= tolerance;
}

export function intersectsRectangle(lhs: Line2Type, rhs: RectangleType): boolean {
	const { bottom, top, left, right } = lines(rhs);
	return intersectsLine2(lhs, top)
		|| intersectsLine2(lhs, bottom)
		|| intersectsLine2(lhs, left)
		|| intersectsLine2(lhs, right);
}

export function intersectsLine2([a1, a2]: Line2Type, [b1, b2]: Line2Type): boolean {
	const sameSign = (x: number, y: number): boolean => x >= 0 && y >= 0 || x <= 0 && y <= 0;

	const x1 = a1.x;
	const y1 = a1.y;
	const x2 = a2.x;
	const y2 = a2.y;
	const x3 = b1.x;
	const y3 = b1.y;
	const x4 = b2.x;
	const y4 = b2.y;

	const s1 = y2 - y1;
	const t1 = x1 - x2;
	const u1 = (x2 * y1) - (x1 * y2);
	const r3 = ((s1 * x3) + (t1 * y3) + u1);
	const r4 = ((s1 * x4) + (t1 * y4) + u1);

	if ((r3 !== 0) && (r4 !== 0) && sameSign(r3, r4)) {
		return false;
	}

	const s2 = y4 - y3;
	const t2 = x3 - x4;
	const u2 = (x4 * y3) - (x3 * y4);

	const r1 = (s2 * x1) + (t2 * y1) + u2;
	const r2 = (s2 * x2) + (t2 * y2) + u2;

	if ((r1 !== 0) && (r2 !== 0) && (sameSign(r1, r2))) {
		return false;
	}

	const a = boundingTLBR(a1, a2);
	const b = boundingTLBR(b1, b2);
	return !(
		a.topLeft.x > b.bottomRight.x
		|| a.topLeft.y > b.bottomRight.y
		|| a.bottomRight.x < b.topLeft.x
		|| a.bottomRight.y < b.topLeft.y
	);
}
