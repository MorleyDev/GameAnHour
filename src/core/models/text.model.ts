
export type Text2 = {
	readonly text: string;
	readonly x: number;
	readonly y: number;
	readonly width?: number;
	readonly fontFamily?: string;
	readonly fontSize?: string;
};

export const Text2 = Object.assign(
	(text: string, x: number, y: number, width?: number, fontSize?: string, fontFamily?: string): Text2 =>  ({ text, x, y, width, fontSize, fontFamily }),
	{
		is: (txt: Partial<Text2>): txt is Text2 => txt.text != null && txt.x != null && txt.y != null,
	}
);
