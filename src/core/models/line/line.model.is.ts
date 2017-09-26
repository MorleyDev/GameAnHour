import { Point2 } from "../shapes.model";
import { Line2Type } from "./line.model.type";
import { Point2Type } from "../point/point.model.type";

export function is(possibly: Point2Type[] | Point2Type): possibly is Line2Type {
	return Array.isArray(possibly) && possibly.length === 2;
}
