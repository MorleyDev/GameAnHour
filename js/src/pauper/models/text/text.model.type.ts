import { Point2Type } from "../point/point.model.type";

export type Text2Type = Point2Type & {
	readonly text: string;
	readonly fontSize?: number;
	readonly fontFamily?: string;
};
