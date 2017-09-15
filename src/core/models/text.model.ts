
export type Text2 = {
	readonly text: string;
	readonly x: number;
	readonly y: number;
	readonly width?: number;
	readonly fontFamily?: string;
	readonly fontSize?: string;
};

export function Text2(text: string, x: number, y: number, width?: number, fontSize?: string, fontFamily?: string): Text2 {
	return { text, x, y, width, fontSize, fontFamily };
}

export function isText2(txt: Partial<Text2>): txt is Text2 {
	return txt.text != null && txt.x != null && txt.y != null;
}
