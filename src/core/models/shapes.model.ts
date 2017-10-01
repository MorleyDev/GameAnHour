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
	}
}
