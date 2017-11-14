
export const linearInterpolation: (start: number, end: number) => (percentage: number) => number =
	(start, end) => percentage => start + (end - start) * percentage;

export const cosineInterpolation: (start: number, end: number) => (percentage: number) => number =
	(start, end) => percentage => {
		const mu2 = (1 - Math.cos(percentage * Math.PI)) / 2;
		return (start * (1 - mu2) + end * mu2);
	};

export const exponentialInterpolation: (power: number) => (start: number, end: number) => (percentage: number) => number =
	power => (start, end) => percentage => linearInterpolation(start, end)(percentage**power);
