import { RectangleType } from "./rectangle.model.type";

export function is(possible: Partial<RectangleType>): possible is RectangleType {
	return possible.x != null && possible.y != null && possible.width != null && possible.height != null;
}
