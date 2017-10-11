import { Vector2Type } from "./vector.maths.type";
import * as func from "./vector.maths.func";
import * as values from "./vector.maths.values";

export type Vector2 = Vector2Type;

export const Vector2 = Object.assign(
	(x: number, y: number) => ({ x, y }),
	{ ...func, ...values }
);
