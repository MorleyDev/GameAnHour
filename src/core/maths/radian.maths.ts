export type Radian = number;

export const Radian = Object.assign(
	(degree: number) => degree * 0.0174533,
	{
		toDegrees: (radian: Radian) => radian / 0.0174533
	}
);
