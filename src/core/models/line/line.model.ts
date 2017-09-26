import { Point2Type } from "../point/point.model.type";
import * as intersect from "./line.model.intersect";
import * as is from "./line.model.is";
import { Line2Type } from "./line.model.type";

export type Line2 = Line2Type;

export const Line2 = Object.assign(
	(a: Point2Type, b: Point2Type): Line2Type => [a, b],
	{ ...intersect, ...is }
);
