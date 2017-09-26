import * as Vector2 from "../../maths/vector.maths";
import * as bounding from "./circle.model.bounding";
import * as is from "./circle.model.is";
import { CircleType } from "./circle.model.type";

export type Circle = CircleType;

export const Circle = Object.assign(
	(x: number, y: number, radius: number) => ({ x, y, radius }),
	{
		...bounding,
		...is,
		overlap: (a: Circle, b: Circle) => Vector2.magnitudeSquared(Vector2.subtract(a, b)) < Vector2.magnitudeSquared({ x: a.radius, y: b.radius })
	}
);
