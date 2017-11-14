import * as bounding from "./circle.model.bounding";
import * as is from "./circle.model.is";
import * as lineTo from "./circle.model.lineTo";
import * as overlap from "./circle.model.overlap";
import { CircleType } from "./circle.model.type";

export type Circle = CircleType;

export const Circle = Object.assign(
	(x: number, y: number, radius: number) => ({ x, y, radius }),
	{
		...bounding,
		...is,
		...overlap,
		...lineTo
	}
);
