import { Point2 } from "../models/point.model";

export type Vector2 = Point2;

export const Vector2 = Object.assign(
	(x: number, y: number): Vector2 => ({ x, y }),
	{
		abs: ({x, y}: Point2): Point2 => ({ x: Math.abs(x), y: Math.abs(y) }),
		invert: ({x, y}: Point2): Point2 => ({ x: -x, y:  -y }),

		add: (lhs: Vector2, rhs: Vector2) => Vector2(lhs.x + rhs.x, lhs.y + rhs.y),
		subtract: (lhs: Vector2, rhs: Vector2) => Vector2(lhs.x - rhs.x, lhs.y - rhs.y),
		multiply: (lhs: Vector2, rhs: number) => Vector2(lhs.x * rhs, lhs.y * rhs),
		divide: (lhs: Vector2, rhs: number) => Vector2(lhs.x / rhs, lhs.y / rhs),

		magnitudeSquared: (lhs: Vector2) => lhs.x * lhs.x + lhs.y * lhs.y,
		magnitude: (lhs: Vector2) => Math.sqrt(Vector2.magnitudeSquared(lhs))
	}
);
