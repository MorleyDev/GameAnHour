import * as Vector2 from "../../maths/vector.maths";
import * as bounding from "./circle.model.bounding";
import * as overlap from "./circle.model.overlap";
import * as is from "./circle.model.is";
import { CircleType } from "./circle.model.type";

export type Circle = CircleType;

export const Circle = Object.assign(
	(x: number, y: number, radius: number) => ({ x, y, radius }),
	{
		...bounding,
		...is,
		...overlap
	}
);
