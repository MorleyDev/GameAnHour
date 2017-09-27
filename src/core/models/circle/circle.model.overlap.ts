import { is as isCircle } from "./circle.model.is";
import { magnitudeSquared, subtract } from "../../maths/vector.maths";
import { Point2Type } from "../point/point.model.type";
import { CircleType } from "./circle.model.type";

export function overlaps(a: CircleType, b: CircleType | Point2Type): boolean {
	if (isCircle(b)) {
		return magnitudeSquared(subtract(a, b)) <= (a.radius +  b.radius) * (a.radius +  b.radius);
	} else {
		return magnitudeSquared(subtract(a, b)) <= a.radius * a.radius;
	}
}
