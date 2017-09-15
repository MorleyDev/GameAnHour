
export type Circle = { readonly x: number, readonly y: number, readonly radius: number };

export function isCircle(possible: Partial<Circle>): possible is Circle {
	return possible.x != null && possible.y != null && possible.radius != null;
}

export function Circle(x: number, y: number, radius: number) {
	return { x, y, radius };
}
