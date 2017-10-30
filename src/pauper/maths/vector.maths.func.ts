import { linearInterpolation as scalarLinearInterpolation, cosineInterpolation as scalarCosineInterpolation, exponentialInterpolation as scalarExponentialInterpolation } from "./interpolation.maths";
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

export function dot(lhs: Vector2Type, rhs: Vector2Type): Vector2Type {
	return {
		x: lhs.x * rhs.x,
		y: lhs.y * rhs.y
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

export function constraint(topLeft: Vector2Type, bottomRight: Vector2Type): (lhs: Vector2Type) => Vector2Type {
	return lhs => ({
		x: Math.min(Math.max(topLeft.x, lhs.x), bottomRight.x),
		y: Math.min(Math.max(topLeft.y, lhs.y), bottomRight.y)
	});
}

export function crossProduct(lhs: Vector2Type, rhs: Vector2Type): number {
	return lhs.x * rhs.y - lhs.y * rhs.x;
}

export function linearInterpolation(lhs: Vector2Type, rhs: Vector2Type): (percentage: number) => Vector2Type {
	const interpolateX = scalarLinearInterpolation(lhs.x, rhs.x);
	const interpolateY = scalarLinearInterpolation(lhs.y, rhs.y);

	return percentage => ({ x: interpolateX(percentage), y: interpolateY(percentage) });
}

export function cosineInterpolation(lhs: Vector2Type, rhs: Vector2Type): (percentage: number) => Vector2Type {
	const interpolateX = scalarCosineInterpolation(lhs.x, rhs.x);
	const interpolateY = scalarCosineInterpolation(lhs.y, rhs.y);

	return percentage => ({ x: interpolateX(percentage), y: interpolateY(percentage) });
}

export function exponentialInterpolation(exponent: number): (lhs: Vector2Type, rhs: Vector2Type) => (percentage: number) => Vector2Type {
	const exponentialInterpolator = scalarExponentialInterpolation(exponent);

	return (lhs: Vector2Type, rhs: Vector2Type): (percentage: number) => Vector2Type => {
		const interpolateX = exponentialInterpolator(lhs.x, rhs.x);
		const interpolateY = exponentialInterpolator(lhs.y, rhs.y);
	
		return percentage => ({ x: interpolateX(percentage), y: interpolateY(percentage) });
	};
}
