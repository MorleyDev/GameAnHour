import { Line2Type } from "./line.model.type";
import { Point2Type } from "../point/point.model.type";

export function is(possibly: Point2Type[]): possibly is Line2Type {
	return possibly.length === 2;
}
