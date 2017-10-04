import { Vector2 } from "../maths/vector.maths";
import { Circle } from "./circle/circle.model";
import { Line2 } from "./line/line.model";
import { Point2 } from "./point/point.model";
import { Rectangle } from "./rectangle/rectangle.model";
import { Text2 } from "./text/text.model";
import { Triangle2 } from "./triangle/triangle.model";

export { Circle } from "./circle/circle.model";
export { Point2 } from "./point/point.model";
export { Line2 } from "./line/line.model";
export { Rectangle } from "./rectangle/rectangle.model";
export { Text2 } from "./text/text.model";
export { Triangle2 } from "./triangle/triangle.model";

export type Shape2 = Rectangle | Circle | Line2 | Text2 | Triangle2 | Point2;

export const Shape2 = {
	collision(lhs: Shape2, rhs: Shape2): boolean {
		if (Line2.is(lhs)) {
			return Line2.intersects(lhs, rhs);
		} else if (Circle.is(lhs)) {
			return Circle.overlaps(lhs, rhs);
		} else if (Rectangle.is(lhs)) {
			return Rectangle.overlaps(lhs, rhs);
		} else if (Triangle2.is(lhs)) {
			return Triangle2.overlaps(lhs, rhs);
		} else {
			console.warn("Collision detection between", lhs, "and", rhs, "is not currently supported");
			return false;
		}
	},

	add(lhs: Shape2, rhs: Vector2): Shape2 {
		if (Array.isArray(lhs)) {
			return lhs.map(vert => Vector2.add(vert, rhs)) as Line2 | Triangle2;
		} else {
			return {
				...lhs,
				...Vector2.add(lhs, rhs)
			};
		}
	},

	lineTo(lhs: Shape2, rhs: Shape2): Line2 {
		if (Line2.is(lhs)) {
			console.warn("Line To with line segments is not supported");
			return Shape2.lineTo(Vector2.add(lhs[0], Vector2.divide(Vector2.subtract(lhs[1], lhs[0]), 2)), rhs);
		} else if (Circle.is(lhs)) {
			return Circle.lineTo(lhs, rhs);
		} else if (Rectangle.is(lhs)) {
			return Rectangle.lineTo(lhs, rhs);
		} else if (Triangle2.is(lhs)) {
			console.warn("Line To with triangles segments is not supported");
			return Shape2.lineTo(lhs[0], rhs);
		} else if (Point2.is(lhs)) {
			const flip = ([a, b]: Line2): Line2 => [b, a];
			if (Line2.is(rhs)) {
				return flip(Shape2.lineTo(rhs, lhs));
			} else if (Circle.is(rhs)) {
				return flip(Circle.lineTo(rhs, lhs));
			} else if (Rectangle.is(rhs)) {
				return flip(Rectangle.lineTo(rhs, lhs));
			} else if (Triangle2.is(rhs)) {
				console.warn("Line To with triangles segments is not supported");
				return flip(Shape2.lineTo(rhs, lhs));
			} else if (Point2.is(rhs)) {
				return [lhs, rhs];
			} else {
				console.warn("Line To between", lhs, "and", rhs, "is not currently supported");
				return rhs;
			}
		} else {
			console.warn("Line To between", lhs, "and", rhs, "is not currently supported");
			return lhs;
		}
	}
}
