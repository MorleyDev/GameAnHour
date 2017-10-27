import { Text2Type } from "./text.model.type";

export function is(possible: Partial<Text2Type>): possible is Text2Type {
	return  possible.text != null && possible.x != null && possible.y != null;
}
