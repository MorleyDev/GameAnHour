import { intersect } from "./line.model.intersect";
import { LineType } from "./line.model.type";
import { Point2 } from "./point.model";

export type Line = LineType;

export const Line = Object.assign(
	(a: Point2, b: Point2) => [a, b],
	{
		is: (possibly: Point2[]): possibly is Line => possibly.length === 2,
		intersect: intersect
	}
);
