import { Colour } from "../models/colour.model";
import { Circle, Rectangle, Text2 } from "../models/shapes.model";
import { Blit, Clear, Fill, Frame, FrameCollection, Origin, RenderTarget, Rotate, Scale, Stroke } from "./render-frame.model";

// Canvas operations break all the rules!
// tslint:disable:no-expression-statement
// tslint:disable:no-object-mutation
// tslint:disable:no-let

export function renderToCanvas({ canvas, context }: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D }, frame: FrameCollection): { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D } {
	return frame.reduce((cc: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D }, command: Frame) => RenderCommand(cc, command), { canvas, context });
}

function RenderCommand({ canvas, context }: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D }, command: Frame): { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D } {
	const commandType = command[0];
	if (Array.isArray(commandType)) {
		return renderToCanvas({ canvas, context }, command as FrameCollection);
	} else {
		switch (commandType) {
			case "clear":
				return renderClear({ canvas, context }, command as Clear);

			case "origin":
				return renderOrigin({ canvas, context }, command as Origin);

			case "rendertarget":
				return renderRenderTarget({ canvas, context }, command as RenderTarget);

			case "rotate":
				return renderRotate({ canvas, context }, command as Rotate);

			case "scale":
				return renderScale({ canvas, context }, command as Scale);

			case "fill":
				return renderFill({ canvas, context }, command as Fill);

			case "stroke":
				return renderStroke({ canvas, context }, command as Stroke);

			case "blit":
				return renderBlit({ canvas, context }, command as Blit);

			default:
				return { canvas, context };
		}
	}
}

function renderOrigin({ canvas, context }: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D }, command: Origin): { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D } {
	const origin = command[1];
	context.translate(origin.x | 0, origin.y | 0);
	renderToCanvas({ canvas, context }, command[2]);
	context.translate(-origin.x | 0, -origin.y | 0);
	return { canvas, context };
}

function renderRotate({ canvas, context }: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D }, command: Rotate): { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D } {
	const rotation = command[1];
	context.rotate(rotation);
	renderToCanvas({ canvas, context }, command[2]);
	context.rotate(-rotation);
	return { canvas, context };
}

function renderScale({ canvas, context }: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D }, command: Scale): { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D } {
	const scale = command[1];
	context.scale(scale.x, scale.y);
	renderToCanvas({ canvas, context }, command[2]);
	context.scale(1 / scale.x, 1 / scale.y);
	return { canvas, context };
}

function renderBlit({ canvas, context }: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D }, command: Blit): { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D } {
	const image = command[1];
	const dst = command[2];
	const src = command[3] as Rectangle | undefined;

	if (Rectangle.is(dst)) {
		if (src != null) {
			context.drawImage(image, src.x | 0, src.y | 0, src.width | 0, src.height | 0, dst.x | 0, dst.y | 0, dst.width | 0, dst.height | 0);
		} else {
			context.drawImage(image, dst.x | 0, dst.y | 0, dst.width | 0, dst.height | 0);
		}
	} else {
		context.drawImage(image, dst.x | 0, dst.y | 0);
	}
	return { canvas, context };
}

function renderFill({ canvas, context }: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D }, fill: Fill): { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D } {
	const shape = fill[1];
	const colour = fill[2];

	context.beginPath();
	context.fillStyle = getRGBA(colour);
	if (Array.isArray(shape)) {
		context.moveTo(shape[0].x | 0, shape[0].y | 0);
		for (let i = 1; i < shape.length; ++i) {
			context.lineTo(shape[i].x | 0, shape[i].y | 0);
		}
		context.fill();
	} else if (Text2.is(shape)) {
		context.font = `${shape.fontSize || "10px"} ${shape.fontFamily || "serif"}`;
		context.fillText(shape.text, shape.x | 0, shape.y | 0, shape.width);
	} else if (Rectangle.is(shape)) {
		context.fillRect(shape.x | 0, shape.y | 0, shape.width | 0, shape.height | 0);
	} else if (Circle.is(shape)) {
		context.arc(shape.x | 0, shape.y | 0, shape.radius | 0, 0, 2 * Math.PI);
		context.fill();
	}
	return { canvas, context };
}

function renderStroke({ canvas, context }: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D }, fill: Stroke): { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D } {
	const shape = fill[1];
	const colour = fill[2];

	context.beginPath();
	context.strokeStyle =  getRGBA(colour);
	if (Array.isArray(shape)) {
		context.moveTo(shape[0].x | 0, shape[0].y | 0);
		for (let i = 1; i < shape.length; ++i) {
			context.lineTo(shape[i].x | 0, shape[i].y | 0);
		}
		context.stroke();
	} else if (Text2.is(shape)) {
		context.font = `${shape.fontSize || "10px"} ${shape.fontFamily || "serif"}`;
		context.strokeText(shape.text, shape.x | 0, shape.y | 0, shape.width);
	} else if (Rectangle.is(shape)) {
		context.strokeRect(shape.x | 0, shape.y | 0, shape.width | 0, shape.height | 0);
	} else if (Circle.is(shape)) {
		context.arc(shape.x | 0, shape.y | 0, shape.radius | 0, 0, 2 * Math.PI);
		context.stroke();
	}
	context.closePath();
	return { canvas, context };
}

function renderClear({ canvas, context }: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D }, clear: Clear): { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D } {
	context.setTransform(
		1, 0, 0,
		1, 0, 0
	);
	context.clearRect(0, 0, canvas.width | 0, canvas.height | 0);

	const colour = clear[1] as Colour | undefined;
	context.fillStyle = colour ? getRGBA(colour) : "black";
	context.fillRect(0, 0, canvas.width | 0, canvas.height | 0);
	return { canvas, context };
}

// tslint:disable-next-line:readonly-keyword
const canvasCache: { [_wh: string]: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D } | null | undefined } = {};

function renderRenderTarget({ canvas, context }: { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D }, [_, dst, frames, size]: RenderTarget): { readonly canvas: HTMLCanvasElement; readonly context: CanvasRenderingContext2D } {
	const width = (size == null ? dst.width : size.x) | 0;
	const height = (size == null ? dst.height : size.y) | 0;
	const key = `${width}${height}`;

	let targetCanvas = canvasCache[key];
	canvasCache[key] = null;
	if (targetCanvas == null) {
		const newCanvas = document.createElement("canvas");
		newCanvas.width = (size == null ? dst.width : size.x) | 0;
		newCanvas.height = (size == null ? dst.height : size.y) | 0;
		targetCanvas = { canvas: newCanvas, context: newCanvas.getContext("2d")! };
	}

	renderToCanvas(targetCanvas, frames);
	context.drawImage(targetCanvas.canvas, dst.x | 0, dst.y | 0, dst.width | 0, dst.height | 0);
	canvasCache[key] = targetCanvas;
	return { canvas, context };
}

function getRGBA(colour: Colour): string {
	return `rgba(${colour.r | 0}, ${colour.g | 0}, ${colour.b | 0}, ${colour.a})`;
}
