import { getCentre } from "./rectangle/rectangle.model.tlbr";
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

	getCentre(shape: Shape2): Point2 {
		if (Array.isArray(shape)) {
			return {
				x: shape.map(a => a.x).reduce((sum, curr) => sum + curr) / shape.length,
				y: shape.map(a => a.y).reduce((sum, curr) => sum + curr) / shape.length
			};
		} else if (Rectangle.is(shape)) {
			return getCentre(shape);
		} else {
			return { x: shape.x, y: shape.y };
		}
	},

	bounding(lhs: Shape2): Rectangle {
		if (Line2.is(lhs)) {
			const topLeft = { x: Math.min(lhs[0].x, lhs[1].x), y: Math.min(lhs[0].y, lhs[1].y) };
			const bottomRight = { x: Math.max(lhs[0].x, lhs[1].x), y: Math.max(lhs[0].y, lhs[1].y) };
			return Rectangle.fromTopLeftBottomRight(topLeft, bottomRight);
		} else if (Triangle2.is(lhs)) {
			const topLeft = { x: Math.min(lhs[0].x, lhs[1].x, lhs[2].x), y: Math.min(lhs[0].y, lhs[1].y, lhs[1].y) };
			const bottomRight = { x: Math.max(lhs[0].x, lhs[1].x, lhs[2].x), y: Math.max(lhs[0].y, lhs[1].y, lhs[2].y) };
			return Rectangle.fromTopLeftBottomRight(topLeft, bottomRight);
		} else if (Circle.is(lhs)) {
			return Rectangle(lhs.x - lhs.radius, lhs.y - lhs.radius, lhs.radius * 2, lhs.radius * 2);
		} else if (Rectangle.is(lhs)) {
			return lhs;
		} else if (Point2.is(lhs)) {
			return Rectangle(lhs.x, lhs.y, 0, 0);
		} else {
			return Rectangle(0, 0, 0, 0);
		}
	},

	lineTo(lhs: Shape2, rhs: Shape2): Line2 {
		if (Line2.is(lhs)) {
			return Line2.lineTo(lhs, rhs);
		} else if (Triangle2.is(lhs)) {
			return Line2.lineTo(lhs, rhs);
		} else if (Circle.is(lhs)) {
			return Circle.lineTo(lhs, rhs);
		} else if (Rectangle.is(lhs)) {
			return Rectangle.lineTo(lhs, rhs);
		} else if (Point2.is(lhs)) {
			const flip = ([a, b]: Line2): Line2 => [b, a];
			if (Line2.is(rhs)) {
				return flip(Shape2.lineTo(rhs, lhs));
			} else if (Circle.is(rhs)) {
				return flip(Circle.lineTo(rhs, lhs));
			} else if (Rectangle.is(rhs)) {
				return flip(Rectangle.lineTo(rhs, lhs));
			} else if (Triangle2.is(rhs)) {
				return flip(Line2.lineTo(rhs, lhs));
			} else if (Point2.is(rhs)) {
				return [lhs, rhs];
			} else {
				return [Point2(0, 0), Point2(0, 0)];
			}
		} else {
			return [Point2(0, 0), Point2(0, 0)];
		}
	}
};
