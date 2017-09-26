import { magnitude, magnitudeSquared, subtract } from "../../maths/vector.maths";
import { CircleType } from "./circle.model.type";

export function overlaps(a: CircleType, b: CircleType): boolean {
	return magnitudeSquared(subtract(a, b)) <= (a.radius +  b.radius) * (a.radius +  b.radius);
}
