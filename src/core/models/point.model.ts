
export type Point2 = { readonly x: number, readonly y: number };

export const Point2 = Object.assign(
	(x: number, y: number): Point2 => ({ x, y }),
	{
		is: (possibly: Partial<Point2>): possibly is Point2 => possibly.x != null && possibly.y != null
	}
);
