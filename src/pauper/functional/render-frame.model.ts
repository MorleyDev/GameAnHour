import { BlittableAsset } from "../core/assets/asset.model";
import { Radian } from "../core/maths/angles.maths";
import { Point2, Rectangle, Shape2 } from "../core/models/shapes.model";

export type Frame = FrameCommand | FrameCollection;
export const Frame = (..._commands: (FrameCommand | Frame)[]) => _commands;

export interface FrameCollection extends Array<Frame | FrameCommand> { };
export type FrameCommand = Clear | Origin | Scale | Rotate | Fill | Stroke | Blit;

export type Clear = ["clear"];
export const Clear: Clear = ["clear"];

export type Origin = ["origin", Point2, FrameCollection];
export const Origin = (origin: Point2, child: FrameCollection): Origin => ["origin", origin, child];

export type Rotate = ["rotate", Radian, FrameCollection];
export const Rotate = (radian: Radian, child: FrameCollection): Rotate => ["rotate", radian, child];

export type Scale = ["scale", Point2, FrameCollection];
export const Scale = (scale: Point2, child: FrameCollection): Scale => ["scale", scale, child];

export type Fill = ["fill", Shape2, string];
export const Fill = (dst: Shape2, colour: string): Fill => ["fill", dst, colour];

export type Stroke = ["stroke", Shape2, string];
export const Stroke = (dst: Shape2, colour: string): Stroke => ["stroke", dst, colour];

export type Blit = ["blit", BlittableAsset, Point2] | ["blit", BlittableAsset, Rectangle, Rectangle];
export const Blit = (image: BlittableAsset, dst: Point2 | Rectangle, src?: Rectangle): Blit => src != null ? ["blit", image, dst, src] : ["blit", image, dst];
