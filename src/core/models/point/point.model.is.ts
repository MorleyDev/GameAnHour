import { Point2Type } from "./point.model.type";

export function is(possibly: Partial<Point2Type>): possibly is Point2Type {
	return  possibly.x != null && possibly.y != null;
}
