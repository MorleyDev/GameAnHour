import { BlittableAsset } from "../assets/asset.model";
import { Radian } from "../maths/angles.maths";
import { Circle, Line2, Point2, Rectangle, Shape2, Text2 } from "../models/shapes.model";
import { Renderer } from "./renderer.service";

export class CanvasRenderer implements Renderer {
	private readonly canvas: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D;

	constructor(element: HTMLElement) {
		this.canvas = element as HTMLCanvasElement;
		this.context = this.canvas.getContext("2d")!;
	}

	public clear(): this {
		this.context.setTransform(
			1, 0, 0,
			1, 0, 0
		);
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		return this;
	}

	public translate(origin: Point2): Renderer {
		this.context.translate(origin.x, origin.y);
		return this;
	}

	public scale(origin: Point2): Renderer {
		this.context.scale(origin.x, origin.y);
		return this;
	}


	public rotate(radians: Radian): Renderer {
		this.context.rotate(radians);
		return this;
	}

	public fill(pos: Shape2, colour: string): this {
		this.context.beginPath();
		this.context.fillStyle = colour;
		if (Array.isArray(pos)) {
			this.context.moveTo(pos[0].x, pos[0].y);
			for(let i = 1; i < pos.length; ++i) {
				this.context.lineTo(pos[i].x, pos[i].y);
			}
			this.context.fill();
		} else if (Text2.is(pos)) {
			this.context.font = `${pos.fontSize || "1em"} ${pos.fontFamily || "Arial"}`;
			this.context.fillText(pos.text, pos.x, pos.y, pos.width);
		} else if (Rectangle.is(pos)) {
			this.context.fillRect(pos.x, pos.y, pos.width, pos.height);
		} else if (Circle.is(pos)) {
			this.context.arc(pos.x, pos.y, pos.radius, 0, 360);
			this.context.fill();
		}
		this.context.closePath();
		return this;
	}

	public stroke(pos: Shape2, colour: string): this {
		this.context.beginPath();
		this.context.strokeStyle = colour;
		if (Array.isArray(pos)) {
			this.context.moveTo(pos[0].x, pos[0].y);
			for(let i = 1; i < pos.length; ++i) {
				this.context.lineTo(pos[i].x, pos[i].y);
			}
			this.context.stroke();
		} else if (Text2.is(pos)) {
			this.context.font = `${pos.fontSize || "10px"} ${pos.fontFamily || "serif"}`;
			this.context.strokeText(pos.text, pos.x, pos.y, pos.width);
		} else if (Rectangle.is(pos)) {
			this.context.strokeRect(pos.x, pos.y, pos.width, pos.height);
		} else if (Circle.is(pos)) {
			this.context.arc(pos.x, pos.y, pos.radius, 0, 2 * Math.PI);
			this.context.stroke();
		}
		this.context.closePath();
		return this;
	}

	public blit(image: BlittableAsset, dst: Point2 | Rectangle, str?: Rectangle): this {
		if (Rectangle.is(dst)) {
			if (str != null) {
				this.context.drawImage(image, str.x, str.y, str.width, str.height, dst.x, dst.y, dst.width, dst.height);
			} else {
				this.context.drawImage(image, dst.x, dst.y, dst.width, dst.height);
			}
		} else {
			this.context.drawImage(image, dst.x, dst.y);
		}
		return this;
	}
}
