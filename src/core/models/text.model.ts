import { Text2Type } from "./text.model.type";

export type Text2 = Text2Type;

export const Text2 = Object.assign(
	(text: string, x: number, y: number, width?: number, fontSize?: string, fontFamily?: string): Text2 =>  ({ text, x, y, width, fontSize, fontFamily }),
	{
		is: (txt: Partial<Text2>): txt is Text2 => txt.text != null && txt.x != null && txt.y != null,
	}
);
