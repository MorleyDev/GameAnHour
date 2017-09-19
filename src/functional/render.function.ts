import { Rectangle } from "../core/models/rectangle.model";
import { Renderer } from "../core/graphics/renderer.service";
import { Point2 } from "../core/models/point.model";
import { Blit, Fill, Frame, FrameCommand, Origin, Rotate, Scale, Stroke } from "./frame.model";

export function Render(canvas: Renderer, frame: Frame): Renderer {
	return frame.reduce((canvas, command) => RenderCommand(canvas, command), canvas);
}

function RenderCommand(canvas: Renderer, command: FrameCommand): Renderer {
	switch (command[0]) {
		case "origin":
			return RenderOrigin(canvas, command as Origin);
		case "rotate":
			return RenderRotate(canvas, command as Rotate);
		case "fill":
			return RenderFill(canvas, command as Fill);
		case "stroke":
			return RenderStroke(canvas, command as Stroke);
		case "clear":
			return RenderClear(canvas);
		case "blit":
			return RenderBlit(canvas, command as Blit);
		default:
			return canvas;
	}
}

function RenderOrigin(canvas: Renderer, command: Origin): Renderer {
	return Render(canvas.translate(command[1]), command[2]).translate({ x: -command[1].x, y: -command[1].y });
}

function RenderRotate(canvas: Renderer, command: Rotate): Renderer {
	return Render(canvas.rotate(command[1]), command[2]).rotate(-command[1]);
}

function RenderScale(canvas: Renderer, command: Scale): Renderer {
	return Render(canvas.scale(command[1]), command[2]).scale({ x: -command[1].x, y: -command[1].y });
}

function RenderBlit(canvas: Renderer, command: Blit): Renderer {
	const image = command[1];
	const src = command[2];
	const dst = command[3] as Rectangle | undefined;

	return canvas.blit(image, src, dst);
}

function RenderFill(canvas: Renderer, fill: Fill): Renderer {
	const shape = fill[1];
	const colour = fill[2];

	return canvas.fill(shape, colour)
}

function RenderStroke(canvas: Renderer, fill: Stroke): Renderer {
	const shape = fill[1];
	const colour = fill[2];

	return canvas.stroke(shape, colour)
}

function RenderClear(canvas: Renderer): Renderer {
	return canvas.clear()
}
