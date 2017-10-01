import { Point2Type } from "../point/point.model.type";
import { Triangle2Type } from "./triangle.model.type";

export function is(possible: Point2Type[] | Point2Type): possible is Triangle2Type {
	return Array.isArray(possible) && possible.length === 3;
}
