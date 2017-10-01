import { Vector2Type } from "./vector.maths.type";

export function abs({ x, y }: Vector2Type): Vector2Type {
	return {
		x: Math.abs(x),
		y: Math.abs(y)
	};
}

export function invert({ x, y }: Vector2Type): Vector2Type {
	return {
		x: -x,
		y: -y
	};
}

export function add(lhs: Vector2Type, rhs: Vector2Type): Vector2Type {
	return {
		x: lhs.x + rhs.x,
		y: lhs.y + rhs.y
	};
}
export function subtract(lhs: Vector2Type, rhs: Vector2Type): Vector2Type {
	return {
		x: lhs.x - rhs.x,
		y: lhs.y - rhs.y
	};
}
export function multiply(lhs: Vector2Type, rhs: number): Vector2Type {
	return {
		x: lhs.x * rhs,
		y: lhs.y * rhs
	};
}

export function divide(lhs: Vector2Type, rhs: number): Vector2Type {
	return {
		x: lhs.x / rhs,
		y: lhs.y / rhs
	};
}

export function magnitudeSquared(lhs: Vector2Type): number {
	return lhs.x * lhs.x + lhs.y * lhs.y;
}

export function magnitude(lhs: Vector2Type): number {
	return Math.sqrt(magnitudeSquared(lhs));
}

export function normalise(lhs: Vector2Type): Vector2Type {
	return divide(lhs, magnitude(lhs));
}

export function dotProduct(lhs: Vector2Type, rhs: Vector2Type): number {
	return lhs.x * rhs.x + lhs.y * rhs.y;
}

export function normal(lhs: Vector2Type): Vector2Type {
	return {
		x: -lhs.y,
		y: lhs.x
	};
}
