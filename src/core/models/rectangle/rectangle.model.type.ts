import { Point2Type } from "../point/point.model.type";

export type RectangleType = Point2Type & { readonly width: number, readonly height: number };
