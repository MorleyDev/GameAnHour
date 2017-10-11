import { Vector2 } from "./core/maths/vector.maths";
import { Circle, Line2, Point2, Shape2, Rectangle, Text2, Triangle2 } from "./core/models/shapes.model";
import { rotate2d, toDegrees, toRadians } from "./core/maths/angles.maths";
import { main } from "./core/main";

export const Maths = {
	angles: { rotate2d, toDegrees, toRadians },
	Vector2
}

export const Shapes = {
	Circle,
	Line2,
	Point2,
	Shape2,
	Rectangle,
	Text2,
	Triangle2
};

export { main };
