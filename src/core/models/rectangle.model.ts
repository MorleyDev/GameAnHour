import { Line } from "./line.model";
import { Point2 } from "./point.model";
import { RectangleType } from "./rectangle.model.type";

export type Rectangle = RectangleType;

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

		boundingTLBR: (...rects: Rectangle[]): { readonly topLeft: Point2; readonly bottomRight: Point2 } =>
			Point2.boundingTLBR(
				...rects,
				...rects.map(rect => Point2(rect.x + rect.width, rect.y + rect.height))
			),

		bounding: (...rects: Rectangle[]): Rectangle => {
			const boundingTLBR = Rectangle.boundingTLBR(...rects);

			return Rectangle.fromTopLeftBottomRight(boundingTLBR.topLeft, boundingTLBR.bottomRight);
		},

		lines: (rectangle: Rectangle): { readonly top: Line; readonly left: Line; readonly bottom: Line; readonly right: Line } => {
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
