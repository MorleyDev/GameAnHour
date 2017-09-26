import { CircleType } from "./circle.model.type";

export function is(possible: Partial<CircleType>): possible is CircleType {
	return possible.x != null && possible.y != null && possible.radius != null;
};
