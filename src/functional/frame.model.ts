import { Circle } from "../core/models/circle.model";
import { Point2 } from "../core/models/point.model";
import { Rectangle } from "../core/models/rectangle.model";
import { Text2 } from "../core/models/text.model";

export interface Frame extends Array<FrameCommand> { };
export type FrameCommand = Origin | Fill | Stroke | Blit | Clear;
export type Clear = ["clear"];
export type Origin = ["origin", Point2, Frame];
export type Fill = ["fill", Rectangle | Text2 | Circle, string];
export type Stroke = ["stroke", Rectangle | Text2 | Circle, string];
export type Blit = ["blit", ImageBitmap, Point2] | ["blit", ImageBitmap, Rectangle, Rectangle];
