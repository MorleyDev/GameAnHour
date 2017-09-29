import { is as isPoint2 } from "../point/point.model.is";
import { Point2Type } from "../point/point.model.type";
import { Line2Type } from "./line.model.type";

export function is(possibly: Partial<Point2Type>[] | Partial<Point2Type>): possibly is Line2Type {
	return Array.isArray(possibly) && possibly.length === 2 && possibly.every(isPoint2);
}
