import { Renderer } from "../core/canvas/renderer.service";
import { Point2 } from "../core/models/point.model";
import { FrameCommand, Fill, Stroke, Frame, Origin } from "./frame.model";

export function Render(canvas: Renderer, frame: Frame, origin?: Point2): Renderer {
	const trueOrigin = origin || Point2(0, 0);
	return frame.reduce((canvas, command) => RenderCommand(canvas, trueOrigin, command), canvas);
}

function RenderCommand(canvas: Renderer, origin: Point2, command: FrameCommand): Renderer {
	switch (command[0]) {
		case "origin":
			return RenderOrigin(canvas, origin, command as Origin);
		case "fill":
			return RenderFill(canvas, origin, command as Fill);
		case "stroke":
			return RenderStroke(canvas, origin, command as Stroke);
		case "clear":
			return RenderClear(canvas);
		default:
			return canvas;
	}
}

function RenderOrigin(canvas: Renderer, origin: Point2, command: Origin): Renderer {
	const trueOrigin = Point2(origin.x - command[1].x, origin.y - command[1].y);

	return Render(canvas, command[2], trueOrigin);
}

function RenderFill(canvas: Renderer, origin: Point2, fill: Fill): Renderer {
	const shape = fill[1];
	const colour = fill[2];

	return canvas.fill({ ...shape, ...OriginShift(origin, shape) }, colour)
}

function RenderStroke(canvas: Renderer, origin: Point2, fill: Stroke): Renderer {
	const shape = fill[1];
	const colour = fill[2];

	return canvas.stroke({ ...shape, ...OriginShift(origin, shape) }, colour)
}

function RenderClear(canvas: Renderer): Renderer {
	return canvas.clear()
}

function OriginShift(origin: Point2, coords: Point2): Point2 {
	return Point2(coords.x - origin.x, coords.y - origin.y);
}
