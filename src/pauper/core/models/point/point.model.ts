import * as bounding from "./point.model.bounding";
import * as tlbr from "./point.model.tlbr";
import { Point2Type } from "./point.model.type";
import * as is from "./point.model.is";

export type Point2 = Point2Type;

export const Point2 = Object.assign(
	(x: number, y: number): Point2 => ({ x, y }),
	{
		...tlbr,
		...bounding,
		...is
	}
);
