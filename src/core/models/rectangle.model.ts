
export type Rectangle = { readonly x: number, readonly y: number, readonly width: number, readonly height: number };

export function Rectangle(x: number, y: number, width: number, height: number): Rectangle {
	return { x, y, width, height };
}

export function isRectangle(possible: Partial<Rectangle>): possible is Rectangle {
	return possible.x != null && possible.y != null && possible.width != null && possible.height != null;
}
