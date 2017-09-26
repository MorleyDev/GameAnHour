import { Point2Type } from "./point.model.type";

export type Text2Type = Point2Type & {
	readonly text: string;
	readonly width?: number;
	readonly fontFamily?: string;
	readonly fontSize?: string;
};
