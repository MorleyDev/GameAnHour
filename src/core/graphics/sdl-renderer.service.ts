import { Blittable } from "../assets/asset.model";
import { Radian } from "../maths/angles.maths";
import { Circle, Line2, Point2, Rectangle, Shape2, Text2 } from "../models/shapes.model";
import { Renderer } from "./renderer.service";

export class SdlRenderer implements Renderer {
	public clear(): this {
		return this;
	}

	public translate(origin: Point2): Renderer {
		return this;
	}

	public scale(origin: Point2): Renderer {
		return this;
	}


	public rotate(radians: Radian): Renderer {
		return this;
	}

	public fill(pos: Shape2, colour: string): this {
		if (Array.isArray(pos)) {
		} else if (Text2.is(pos)) {
		} else if (Rectangle.is(pos)) {
		} else if (Circle.is(pos)) {
		}
		return this;
	}

	public stroke(pos: Shape2, colour: string): this {
		if (Array.isArray(pos)) {
		} else if (Text2.is(pos)) {
		} else if (Rectangle.is(pos)) {
		} else if (Circle.is(pos)) {
		}
		return this;
	}

	public blit(image: Blittable, dst: Point2 | Rectangle, str?: Rectangle): this {
		if (Rectangle.is(dst)) {
			if (str != null) {
				//drawImage(image, str.x, str.y, str.width, str.height, dst.x, dst.y, dst.width, dst.height);
			} else {
				//drawImage(image, dst.x, dst.y, dst.width, dst.height);
			}
		} else {
			//drawImage(image, dst.x, dst.y);
		}
		return this;
	}
}
