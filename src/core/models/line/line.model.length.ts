import * as Vector2 from "../../maths/vector.maths";
import { Line2Type } from "./line.model.type";

export function lengthOf(line: Line2Type): number {
	return Vector2.magnitude( Vector2.subtract(line[1], line[0]) );
}
