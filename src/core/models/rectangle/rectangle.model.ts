import { Line2 } from "../line/line.model";
import { Point2 } from "../point/point.model";
import * as bounding from "./rectangle.model.bounding";
import * as  is from "./rectangle.model.is";
import * as tlbr from "./rectangle.model.tlbr";
import { RectangleType } from "./rectangle.model.type";

export type Rectangle = RectangleType;

export const Rectangle = Object.assign(
	(x: number, y: number, width: number, height: number): Rectangle => ({ x, y, width, height }),
	{
		...bounding,
		...tlbr,
		...is,

		overlaps: (a: Rectangle, b: Rectangle): boolean => !(
			a.x > b.x + b.width
			|| a.y > b.y + b.height
			|| a.x + a.width < b.x
			|| a.y + a.height < b.y
		),

		lines: (rectangle: Rectangle): { readonly top: Line2; readonly left: Line2; readonly bottom: Line2; readonly right: Line2 } => {
			const bounding = Rectangle.boundingTLBR(rectangle);

			return {
				top: [bounding.topLeft, Point2(bounding.bottomRight.x,bounding.topLeft.y) ],
				left: [bounding.topLeft, Point2(bounding.topLeft.x, bounding.bottomRight.y) ],
				bottom: [Point2(bounding.topLeft.x, bounding.bottomRight.y), bounding.bottomRight ],
				right: [Point2(bounding.bottomRight.x, bounding.topLeft.y), bounding.bottomRight ]
			};
		}
	}
);
