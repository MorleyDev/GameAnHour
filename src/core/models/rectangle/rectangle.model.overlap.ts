import { RectangleType } from "./rectangle.model.type";

export function overlaps(a: RectangleType, b: RectangleType): boolean {
	return !(
		a.x > b.x + b.width
		|| a.y > b.y + b.height
		|| a.x + a.width < b.x
		|| a.y + a.height < b.y
	);
}
