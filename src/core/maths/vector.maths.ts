export type Vector2 = {
	readonly x: number;
	readonly y: number;
};

export const Zero: Vector2 = { x: 0, y: 0 };

export const Unit: Vector2 = { x: Math.sqrt(0.5), y: Math.sqrt(0.5) };

export function abs({ x, y }: Vector2): Vector2 {
	return {
		x: Math.abs(x),
		y: Math.abs(y)
	};
}

export function invert({ x, y }: Vector2): Vector2 {
	return {
		x: -x,
		y: -y
	};
}

export function add(lhs: Vector2, rhs: Vector2): Vector2 {
	return {
		x: lhs.x + rhs.x,
		y: lhs.y + rhs.y
	};
}
export function subtract(lhs: Vector2, rhs: Vector2): Vector2 {
	return {
		x: lhs.x - rhs.x,
		y: lhs.y - rhs.y
	};
}
export function multiply(lhs: Vector2, rhs: number): Vector2 {
	return {
		x: lhs.x * rhs,
		y: lhs.y * rhs
	};
}

export function divide(lhs: Vector2, rhs: number): Vector2 {
	return {
		x: lhs.x / rhs,
		y: lhs.y / rhs
	};
}

export function magnitudeSquared(lhs: Vector2): number {
	return lhs.x * lhs.x + lhs.y * lhs.y;
}

export function magnitude(lhs: Vector2): number {
	return Math.sqrt(magnitudeSquared(lhs));
}

export function normalise(lhs: Vector2): Vector2 {
	return divide(lhs, magnitude(lhs));
}

export function dotProduct(lhs: Vector2, rhs: Vector2): number {
	return lhs.x * rhs.x + lhs.y * rhs.y;
}

export function normal(lhs: Vector2): Vector2 {
	return {
		x: -lhs.y,
		y: lhs.x
	};
}
