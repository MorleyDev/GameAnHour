import { Renderer } from "../core/graphics/renderer.service";
import { Rectangle } from "../core/models/shapes.model";
import { Blit, Fill, Frame, FrameCollection, Origin, Rotate, Scale, Stroke } from "./render-frame.model";

export function Render(canvas: Renderer, frame: FrameCollection): Renderer {
	return frame.reduce((canvas, command) => RenderCommand(canvas, command), canvas);
}

function RenderCommand(canvas: Renderer, command: Frame): Renderer {
	const commandType = command[0];
	if (Array.isArray(commandType)) {
		return Render(canvas, command as FrameCollection);
	} else {
		switch (commandType) {
			case "clear":
				return RenderClear(canvas);

			case "origin":
				return RenderOrigin(canvas, command as Origin);

			case "rotate":
				return RenderRotate(canvas, command as Rotate);

			case "scale":
				return RenderScale(canvas, command as Scale);

			case "fill":
				return RenderFill(canvas, command as Fill);

			case "stroke":
				return RenderStroke(canvas, command as Stroke);

			case "blit":
				return RenderBlit(canvas, command as Blit);

			default:
				return canvas;
		}
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

	return canvas.fill(shape, colour);
}

function RenderStroke(canvas: Renderer, fill: Stroke): Renderer {
	const shape = fill[1];
	const colour = fill[2];

	return canvas.stroke(shape, colour);
}

function RenderClear(canvas: Renderer): Renderer {
	return canvas.clear();
}
