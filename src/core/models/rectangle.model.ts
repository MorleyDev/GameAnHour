import { Line } from "./line.model";
import { Point2 } from "./point.model";

export type Rectangle = { readonly x: number, readonly y: number, readonly width: number, readonly height: number };

export const Rectangle = Object.assign(
	(x: number, y: number, width: number, height: number): Rectangle => ({ x, y, width, height }),
	{
		getTopLeft: (rectangle: Rectangle): Point2 => ({ x: rectangle.x, y: rectangle.y }),
		getTopRight: (rectangle: Rectangle): Point2 => ({ x: rectangle.x + rectangle.width, y: rectangle.y }),
		getBottomLeft: (rectangle: Rectangle): Point2 => ({ x: rectangle.x, y: rectangle.y + rectangle.height }),
		getBottomRight: (rectangle: Rectangle): Point2 => ({ x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height }),
		fromTopLeftBottomRight: (tl: Point2, br: Point2): Rectangle => Rectangle(tl.x, tl.y, br.x - tl.x, br.y - tl.y),

		overlaps: (a: Rectangle, b: Rectangle): boolean => !(
			a.x > b.x + b.width
			|| a.y > b.y + b.height
			|| a.x + a.width < b.x
			|| a.y + a.height < b.y
		),

		boundingTLBR: (...rects: Rectangle[]): { topLeft: Point2; bottomRight: Point2 } => {
			const tlX = Math.min(...rects.map(rect => rect.x));
			const tlY = Math.min(...rects.map(rect => rect.y));
			const brX = Math.max(...rects.map(rect => rect.x + rect.width));
			const brY = Math.max(...rects.map(rect => rect.y + rect.height));

			return { topLeft: Point2(tlX, tlY), bottomRight: Point2(brX, brY) };
		},

		bounding: (a: Rectangle, b: Rectangle): Rectangle => {
			const boundingTLBR = Rectangle.boundingTLBR(a, b);

			return Rectangle.fromTopLeftBottomRight(boundingTLBR.topLeft, boundingTLBR.bottomRight);
		},

		lines: (rectangle: Rectangle): { top: Line; left: Line; bottom: Line; right: Line } => {
			const bounding = Rectangle.boundingTLBR(rectangle);

			return {
				top: [bounding.topLeft, Point2(bounding.bottomRight.x,bounding.topLeft.y) ],
				left: [bounding.topLeft, Point2(bounding.topLeft.x, bounding.bottomRight.y) ],
				bottom: [Point2(bounding.topLeft.x, bounding.bottomRight.y), bounding.bottomRight ],
				right: [Point2(bounding.bottomRight.x, bounding.topLeft.y), bounding.bottomRight ]
			}
		},

		is: (possible: Partial<Rectangle>): possible is Rectangle => (possible.x != null && possible.y != null && possible.width != null && possible.height != null)
	}
);
