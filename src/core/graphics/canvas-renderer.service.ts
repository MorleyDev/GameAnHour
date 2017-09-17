import { Circle, isCircle } from "../models/circle.model";
import { Point2 } from "../models/point.model";
import { isRectangle, Rectangle } from "../models/rectangle.model";
import { isText2, Text2 } from "../models/text.model";
import { Renderer } from "./renderer.service";

export class CanvasRenderer implements Renderer {
	private readonly canvas: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D;

	constructor(element: HTMLElement) {
		this.canvas = element as HTMLCanvasElement;
		this.context = this.canvas.getContext("2d")!;
	}

	public clear(): this {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		return this;
	}

	public fill(pos: Rectangle | Circle | Text2, colour: string): this {

		this.context.beginPath();
		this.context.fillStyle = colour;
		if (isText2(pos)) {
			this.context.font = `${pos.fontFamily || "Arial"} ${pos.fontSize || "1em"}` 
			this.context.fillText(pos.text, pos.x, pos.y, pos.width);
		} else if (isRectangle(pos)) {
			this.context.fillRect(pos.x, pos.y, pos.width, pos.height);
		} else if (isCircle(pos)) {
			this.context.arc(pos.x, pos.y, pos.radius, 0, 360);
			this.context.fill();
		}
		this.context.closePath();
		return this;
	}

	public stroke(pos: Rectangle | Circle | Text2, colour: string): this {
		this.context.beginPath();
		this.context.strokeStyle = colour;
		if (isText2(pos)) {
			this.context.font = `${pos.fontFamily || "Arial"} ${pos.fontSize || "1em"}` 
			this.context.strokeText(pos.text, pos.x, pos.y, pos.width);
		} else if (isRectangle(pos)) {
			this.context.strokeRect(pos.x, pos.y, pos.width, pos.height);
		} else if (isCircle(pos)) {
			this.context.arc(pos.x, pos.y, pos.radius, 0, 360);
			this.context.stroke();
		}
		this.context.closePath();
		return this;
	}

	public blit(image: ImageBitmap, dst: Point2 | Rectangle, str?: Rectangle): this {
		if (isRectangle(dst)) {
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
