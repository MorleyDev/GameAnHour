import * as is from "./triangle.model.is";
import * as overlaps from "./triangle.model.overlap";
import { Point2Type } from "../point/point.model.type";
import { Triangle2Type } from "./triangle.model.type";

export type Triangle2 = Triangle2Type;

export const Triangle2 = Object.assign(
	(a: Point2Type, b: Point2Type, c: Point2Type): Triangle2Type => [a, b, c],
	{
		...is,
		...overlaps
	}
);
