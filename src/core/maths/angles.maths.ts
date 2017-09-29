import { Vector2 } from "./vector.maths";
export type Radian = number;
export type Degree = number;

export function toDegrees(radian: Radian): Degree {
	return radian / 0.0174533;
}

export function toRadians(degrees: Degree): Radian {
	return degrees * 0.0174533;
}

export function rotate2d(vec: Vector2, radians: Radian): Vector2 {
	return {
		x: vec.x * Math.cos(radians) - vec.y * Math.sin(radians),
		y: vec.x * Math.sin(radians) + vec.y * Math.cos(radians)
	};
}
