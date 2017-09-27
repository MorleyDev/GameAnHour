import { add, multiply, normalise, subtract } from "../../maths/vector.maths";
import { Line2Type } from "../line/line.model.type";
import { Point2Type } from "../point/point.model.type";
import { CircleType } from "./circle.model.type";

export function lineTo(lhs: CircleType, rhs: Point2Type): Line2Type {
	const offset = subtract(rhs, lhs);
	const normalised = add(multiply(normalise(offset), lhs.radius), lhs);

	return [normalised, rhs];
}
