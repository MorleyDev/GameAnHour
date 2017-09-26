import { RectangleType } from "./rectangle.model.type";

export type Point2 = { readonly x: number, readonly y: number };

export const Point2 = Object.assign(
	(x: number, y: number): Point2 => ({ x, y }),
	{
		is: (possibly: Partial<Point2>): possibly is Point2 => possibly.x != null && possibly.y != null,

		boundingTLBR: (...points: Point2[]): { readonly topLeft: Point2; readonly bottomRight: Point2 } => {
			const tlX = Math.min(...points.map(point => point.x));
			const tlY = Math.min(...points.map(point => point.y));
			const brX = Math.max(...points.map(point => point.x));
			const brY = Math.max(...points.map(point => point.y));

			return { topLeft: Point2(tlX, tlY), bottomRight: Point2(brX, brY) };
		},

		bounding: (...points: Point2[]): RectangleType => {
			const { topLeft, bottomRight } = Point2.boundingTLBR(...points);

			return {
				x: topLeft.x,
				y: topLeft.y,
				width: bottomRight.x - topLeft.x,
				height: bottomRight.y - topLeft.y
			};
		}
	}
);
