export type Radian = number;
export type Degree = number;

export function toDegrees(radian: Radian): Degree {
	return radian / 0.0174533;
}

export function toRadians(degrees: Degree): Radian {
	return degrees * 0.0174533;
}
