import { BlittableAsset } from "../assets/asset.model";
import { Radian } from "../maths/angles.maths";
import { Point2, Rectangle, Shape2 } from "../models/shapes.model";
import { Colour } from "../models/colour.model";

export type Frame = FrameCommand | FrameCollection;
export const Frame = (..._commands: (FrameCommand | Frame)[]) => _commands;

export interface FrameCollection extends Array<Frame | FrameCommand> { }
export type FrameCommand = Clear | Origin | Scale | Rotate | Fill | Stroke | Blit | RenderTarget;

export enum FrameCommandType {
	Clear,
	Origin,
	Rotate,
	Scale,
	Fill,
	Stroke,
	Blit,
	RenderTarget
}

export type Clear = [FrameCommandType.Clear] | [FrameCommandType.Clear, Colour];
export const Clear = (colour?: Colour): Clear => colour != null ? [FrameCommandType.Clear, colour] : [FrameCommandType.Clear];

export type Origin = [FrameCommandType.Origin, Point2, FrameCollection];
export const Origin = (origin: Point2, child: FrameCollection): Origin => [FrameCommandType.Origin, origin, child];

export type Rotate = [FrameCommandType.Rotate, Radian, FrameCollection];
export const Rotate = (radian: Radian, child: FrameCollection): Rotate => [FrameCommandType.Rotate, radian, child];

export type Scale = [FrameCommandType.Scale, Point2, FrameCollection];
export const Scale = (scale: Point2, child: FrameCollection): Scale => [FrameCommandType.Scale, scale, child];

export type Fill = [FrameCommandType.Fill, Shape2, Colour];
export const Fill = (dst: Shape2, colour: Colour): Fill => [FrameCommandType.Fill, dst, colour];

export type Stroke = [FrameCommandType.Stroke, Shape2, Colour];
export const Stroke = (dst: Shape2, colour: Colour): Stroke => [FrameCommandType.Stroke, dst, colour];

export type Blit = [FrameCommandType.Blit, BlittableAsset, Point2] | [FrameCommandType.Blit, BlittableAsset, Rectangle, Rectangle];
export const Blit = (image: BlittableAsset, dst: Point2 | Rectangle, src?: Rectangle): Blit => src != null ? [FrameCommandType.Blit, image, dst, src] : [FrameCommandType.Blit, image, dst];

export type RenderTarget = [FrameCommandType.RenderTarget, Rectangle, FrameCollection, Point2 | undefined];
export const RenderTarget = (dst: Rectangle, frame: FrameCollection, size?: Point2): RenderTarget => [FrameCommandType.RenderTarget, dst, frame, size];
