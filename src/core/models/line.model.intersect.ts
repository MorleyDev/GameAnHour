import { LineType } from "./line.model.type";

export const intersect = ([a1, a2]: LineType, [b1, b2]: LineType): boolean => {
	const sameSign = (x: number, y: number): boolean => x >= 0 && y >= 0 || x <= 0 && y <= 0;

	const x1 = a1.x;
	const y1 = a1.y;
	const x2 = a2.x;
	const y2 = a2.y;
	const x3 = b1.x;
	const y3 = b1.y;
	const x4 = b2.x;
	const y4 = b2.y;

	const s1 = y2 - y1;
	const t1 = x1 - x2;
	const u1 = (x2 * y1) - (x1 * y2);
	const r3 = ((s1 * x3) + (t1 * y3) + u1);
	const r4 = ((s1 * x4) + (t1 * y4) + u1);

	if ((r3 !== 0) && (r4 !== 0) && sameSign(r3, r4)) {
		return false;
	}

	const s2 = y4 - y3;
	const t2 = x3 - x4;
	const u2 = (x4 * y3) - (x3 * y4);

	const r1 = (s2 * x1) + (t2 * y1) + u2;
	const r2 = (s2 * x2) + (t2 * y2) + u2;

	if ((r1 !== 0) && (r2 !== 0) && (sameSign(r1, r2))) {
		return false;
	}
	return true;
}