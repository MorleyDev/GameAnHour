import { Blittable } from "../core/assets/asset.model";
import { Radian } from "../core/maths/radian.maths";
import { Circle } from "../core/models/circle.model";
import { Point2 } from "../core/models/point.model";
import { Rectangle } from "../core/models/rectangle.model";
import { Text2 } from "../core/models/text.model";

export interface Frame extends Array<Frame | FrameCommand> { };
export const Frame = (...commands: (FrameCommand | Frame)[]) => commands;

export type FrameCommand = Origin | Rotate | Fill | Stroke | Blit | Clear;

export type Clear = ["clear"];
export const Clear: Clear = ["clear"];

export type Origin = ["origin", Point2, Frame];
export const Origin = (origin: Point2, child: Frame): Origin => ["origin", origin, child];

export type Rotate = ["rotate", Radian, Frame];
export const Rotate = (radian: Radian, child: Frame): Rotate => ["rotate", radian, child];

export type Scale = ["scale", Point2, Frame];
export const Scale = (scale: Point2, child: Frame): Scale => ["scale", scale, child];

export type Fill = ["fill", Rectangle | Text2 | Circle, string];
export const Fill = (dst: Rectangle | Text2 | Circle, colour: string): Fill => ["fill", dst, colour];

export type Stroke = ["stroke", Rectangle | Text2 | Circle, string];
export const Stroke = (dst: Rectangle | Text2 | Circle, colour: string): Stroke => ["stroke", dst, colour];

export type Blit = ["blit", Blittable, Point2] | ["blit", Blittable, Rectangle, Rectangle];
export const Blit = (image: Blittable, dst: Point2 | Rectangle, src?: Rectangle): Blit => src != null ? ["blit", image, dst, src] : ["blit", image, dst];
