import * as is from "./text.model.is";
import { Text2Type } from "./text.model.type";

export type Text2 = Text2Type;

export const Text2 = Object.assign(
	(text: string, x: number, y: number, width?: number, fontSize?: string, fontFamily?: string): Text2 => ({ text, x, y, width, fontSize, fontFamily }),
	{
		...is
	}
);
