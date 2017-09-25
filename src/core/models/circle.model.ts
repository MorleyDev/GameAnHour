import { Vector2 } from "../maths/vector.maths";
import { Rectangle } from "./rectangle.model";

export type Circle = { readonly x: number, readonly y: number, readonly radius: number };

export function isCircle(possible: Partial<Circle>): possible is Circle {
	return possible.x != null && possible.y != null && possible.radius != null;
}

export const Circle = Object.assign(
	(x: number, y: number, radius: number) => ({ x, y, radius }),
	{
		is: (possible: Partial<Circle>): possible is Circle => possible.x != null && possible.y != null && possible.radius != null,
		boundingBox: (circle: Circle): Rectangle => Rectangle(circle.x - circle.radius, circle.y - circle.radius, circle.radius * 2, circle.radius * 2),
		overlap: (a: Circle, b: Circle) => Vector2.magnitudeSquared(Vector2.subtract(a, b)) < a.radius * a.radius + b.radius * b.radius
	}
);
