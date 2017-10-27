import { Vector2Type } from "./vector.maths.type";

export type Radian = number;
export type Degree = number;

export function toDegrees(radian: Radian): Degree {
	return radian / 0.0174533;
}

export function toRadians(degrees: Degree): Radian {
	return degrees * 0.0174533;
}

export function rotate2d(vec: Vector2Type, radians: Radian): Vector2Type {
	const cosine = Math.cos(-radians);
	const sine = Math.sin(-radians);

	return {
		x: vec.x * cosine - vec.y * sine,
		y: vec.x * sine + vec.y * cosine
	};
}
