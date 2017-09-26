import { magnitudeSquared, subtract } from "../../maths/vector.maths";
import { CircleType } from "./circle.model.type";

export function overlaps(a: CircleType, b: CircleType): boolean {
	return magnitudeSquared(subtract(a, b)) < magnitudeSquared({ x: a.radius, y: b.radius });
}
