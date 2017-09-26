import { Blittable } from "../assets/asset.model";
import { Radian } from "../maths/angles.maths";
import { Line2 } from "../models/line/line.model";
import { Circle, Point2, Rectangle, Text2 } from "../models/shapes.model";

export abstract class Renderer {
	public abstract clear(): Renderer;

	public abstract translate(origin: Point2): Renderer;
	public abstract scale(scale: Point2): Renderer;
	public abstract rotate(radians: Radian): Renderer;

	public abstract fill(pos: Rectangle | Circle | Text2, colour: string): Renderer;
	public abstract stroke(pos: Rectangle | Circle | Text2 | Line2, colour: string): Renderer;
	public abstract blit(image: Blittable, dst: Point2 | Rectangle, str?: Rectangle): Renderer;
}
