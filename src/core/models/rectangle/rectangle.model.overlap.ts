import { RectangleType } from "./rectangle.model.type";
import { Point2Type } from "../point/point.model.type";
import { is as isRect } from "./rectangle.model.is";

export function overlaps(lhs: RectangleType, rhs: RectangleType | Point2Type): boolean {
	if (isRect(rhs)) {
		return overlapsRectangle(lhs, rhs);
	} else {
		return overlapsPoint2(lhs, rhs);
	}
}

function overlapsRectangle(lhs: RectangleType, rhs: RectangleType): boolean {
	return !(
		lhs.x > rhs.x + rhs.width
		|| lhs.y > rhs.y + rhs.height
		|| lhs.x + lhs.width < rhs.x
		|| lhs.y + lhs.height < rhs.y
	);
}

function overlapsPoint2(lhs: RectangleType, rhs: Point2Type) {
	return rhs.x >= lhs.x && rhs.x <= lhs.x + lhs.width && rhs.y >= lhs.y && rhs.y <= lhs.y + lhs.height;
}
