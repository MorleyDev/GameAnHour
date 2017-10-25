import { CircleType } from "./circle/circle.model.type";
import { Line2Type } from "./line/line.model.type";
import { Point2Type } from "./point/point.model.type";
import { RectangleType } from "./rectangle/rectangle.model.type";
import { Text2Type } from "./text/text.model.type";
import { Triangle2Type } from "./triangle/triangle.model.type";

export type Shape2Type = RectangleType | CircleType | Triangle2Type | Line2Type | Text2Type | Point2Type;
