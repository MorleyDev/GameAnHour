import { is as isCircle } from "../circle/circle.model.is";
import { CircleType } from "../circle/circle.model.type";
import { lengthOf } from "../line/line.model.length";
import { Point2Type } from "../point/point.model.type";
import { is as isRect } from "./rectangle.model.is";
import { lineTo } from "./rectangle.model.lineTo";
import { RectangleType } from "./rectangle.model.type";

export function overlaps(lhs: RectangleType, rhs: RectangleType | CircleType | Point2Type): boolean {
	if (isRect(rhs)) {
		return overlapsRectangle(lhs, rhs);
	} else if (isCircle(rhs)) {
		return overlapsCircle(lhs, rhs);
	} else {
		return overlapsPoint2(lhs, rhs);
	}
}

export function overlapsRectangle(lhs: RectangleType, rhs: RectangleType): boolean {
	return !(
		lhs.x > rhs.x + rhs.width
		|| lhs.y > rhs.y + rhs.height
		|| lhs.x + lhs.width < rhs.x
		|| lhs.y + lhs.height < rhs.y
	);
}

export function overlapsCircle(lhs: RectangleType, rhs: CircleType): boolean {
	return overlapsPoint2(lhs, rhs) || lengthOf( lineTo(lhs, rhs) ) <= rhs.radius;
}

export function overlapsPoint2(lhs: RectangleType, rhs: Point2Type) {
	return rhs.x >= lhs.x && rhs.x <= lhs.x + lhs.width && rhs.y >= lhs.y && rhs.y <= lhs.y + lhs.height;
}
