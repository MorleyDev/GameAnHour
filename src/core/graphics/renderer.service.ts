import { Text2 } from "../models/text.model";
import { Circle } from "../models/circle.model";
import { Point2 } from "../models/point.model";
import { Rectangle } from "../models/rectangle.model";

export abstract class Renderer {
	public abstract clear(): Renderer;

	public abstract fill(pos: Rectangle | Circle | Text2, colour: string): Renderer;
	public abstract stroke(pos: Rectangle | Circle | Text2, colour: string): Renderer;
	public abstract blit(image: ImageBitmap, dst: Point2 | Rectangle, str?: Rectangle): Renderer;
}
