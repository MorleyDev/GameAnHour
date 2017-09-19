import { Blittable } from "../assets/asset.model";
import { Radian } from "../maths/radian.maths";
import { Circle } from "../models/circle.model";
import { Point2 } from "../models/point.model";
import { Rectangle } from "../models/rectangle.model";
import { Text2 } from "../models/text.model";

export abstract class Renderer {
	public abstract clear(): Renderer;

	public abstract translate(origin: Point2): Renderer;
	public abstract scale(scale: Point2): Renderer;
	public abstract rotate(radians: Radian): Renderer;
	
	public abstract fill(pos: Rectangle | Circle | Text2, colour: string): Renderer;
	public abstract stroke(pos: Rectangle | Circle | Text2, colour: string): Renderer;
	public abstract blit(image: Blittable, dst: Point2 | Rectangle, str?: Rectangle): Renderer;
}
