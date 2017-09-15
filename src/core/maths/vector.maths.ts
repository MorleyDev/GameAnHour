import { Point2 } from "../models/point.model";

export type Vector2 = Point2;

function Vector2Func(x: number, y: number): Vector2 {
	return { x, y };
}

const Vector2Maths = {
	add: (lhs: Vector2, rhs: Vector2) => Vector2Func(lhs.x + rhs.x, lhs.y + rhs.y),
	subtract: (lhs: Vector2, rhs: Vector2) => Vector2Func(lhs.x - rhs.x, lhs.y - rhs.y),
	multiply: (lhs: Vector2, rhs: number) => Vector2Func(lhs.x * rhs, lhs.y * rhs),
	divide: (lhs: Vector2, rhs: number) => Vector2Func(lhs.x / rhs, lhs.y / rhs),
	magnitudeSquared: (lhs: Vector2) => lhs.x * lhs.x + lhs.y * lhs.y,
	magnitude: (lhs: Vector2) => Math.sqrt(Vector2Maths.magnitudeSquared(lhs))
};

export const Vector2 = Object.assign(Vector2Func, Vector2Maths);
