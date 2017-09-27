import { CircleType } from "./circle.model.type";

export function is(possible: Partial<CircleType>): possible is CircleType {
	return possible.radius != null && possible.x != null && possible.y != null;
};
