import { AssetLoader } from "../assets/asset-loader.service";
import { RGBA, RGB } from "../models/colour.model";
import { Circle, Rectangle, Text2 } from "../models/shapes.model";
import { Blit, Clear, Fill, Frame, FrameCollection, FrameCommandType, Origin, RenderTarget, Rotate, Scale, Stroke } from "./render-frame.model";

type Target = {
	readonly canvas: HTMLCanvasElement;
	readonly context: CanvasRenderingContext2D;
	readonly assets: AssetLoader;
};

export function renderToCanvas(target: Target, frame: FrameCollection): void {
	return frame.forEach((command: Frame) => RenderCommand(target, command));
}

function RenderCommand(target: Target, command: Frame): void {
	const commandType = command[0];
	if (!Array.isArray(commandType)) {
		switch (commandType) {
			case FrameCommandType.Clear:
				return renderClear(target, command as Clear);

			case FrameCommandType.Origin:
				return renderOrigin(target, command as Origin);

			case FrameCommandType.RenderTarget:
				return renderRenderTarget(target, command as RenderTarget);

			case FrameCommandType.Rotate:
				return renderRotate(target, command as Rotate);

			case FrameCommandType.Scale:
				return renderScale(target, command as Scale);

			case FrameCommandType.Fill:
				return renderFill(target, command as Fill);

			case FrameCommandType.Stroke:
				return renderStroke(target, command as Stroke);

			case FrameCommandType.Blit:
				return renderBlit(target, command as Blit);
		}
	} else  {
		return (command as FrameCollection).forEach(c => RenderCommand(target, c));
	}
}

function renderOrigin({ canvas, context, assets }: Target, command: Origin): void {
	const origin = command[1];
	context.translate(origin.x | 0, origin.y | 0);
	renderToCanvas({ canvas, context, assets }, command[2]);
	context.translate(-origin.x | 0, -origin.y | 0);
}

function renderRotate({ canvas, context, assets }: Target, command: Rotate): void {
	const rotation = command[1];
	context.rotate(rotation);
	renderToCanvas({ canvas, context, assets }, command[2]);
	context.rotate(-rotation);
}

function renderScale({ canvas, context, assets }: Target, command: Scale): void {
	const scale = command[1];
	context.scale(scale.x, scale.y);
	renderToCanvas({ canvas, context, assets }, command[2]);
	context.scale(1 / scale.x, 1 / scale.y);
}

function renderBlit({ canvas, context, assets }: Target, command: Blit): void {
	const image = command[1] as string;
	const dst = command[2];
	const src = command[3] as Rectangle | undefined;
	const imgAsset = assets.getImage(image) as HTMLImageElement | HTMLVideoElement;

	if (Rectangle.is(dst)) {
		if (src != null) {
			context.drawImage(imgAsset, src.x | 0, src.y | 0, src.width | 0, src.height | 0, dst.x | 0, dst.y | 0, dst.width | 0, dst.height | 0);
		} else {
			context.drawImage(imgAsset, dst.x | 0, dst.y | 0, dst.width | 0, dst.height | 0);
		}
	} else {
		context.drawImage(imgAsset, dst.x | 0, dst.y | 0);
	}
}

function renderFill({ canvas, context, assets }: Target, fill: Fill): void {
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
		const size = shape.fontSize || 10;
		context.font = `${size}px ${shape.fontFamily || "serif"}`;
		context.fillText(shape.text, shape.x | 0, (shape.y + (size)) | 0);
	} else if (Rectangle.is(shape)) {
		context.fillRect(shape.x | 0, shape.y | 0, shape.width | 0, shape.height | 0);
	} else if (Circle.is(shape)) {
		context.arc(shape.x | 0, shape.y | 0, shape.radius | 0, 0, 2 * Math.PI);
		context.fill();
	}
}

function renderStroke({ canvas, context, assets }: Target, fill: Stroke): void {
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
		const size = shape.fontSize || 10;
		context.font = `${size}px ${shape.fontFamily || "serif"}`;
		context.strokeText(shape.text, shape.x | 0, (shape.y + (size / 2)) | 0);
	} else if (Rectangle.is(shape)) {
		context.strokeRect(shape.x | 0, shape.y | 0, shape.width | 0, shape.height | 0);
	} else if (Circle.is(shape)) {
		context.arc(shape.x | 0, shape.y | 0, shape.radius | 0, 0, 2 * Math.PI);
		context.stroke();
	}
	context.closePath();
}

function renderClear({ canvas, context, assets }: Target, clear: Clear): void {
	context.setTransform(
		1, 0, 0,
		1, 0, 0
	);
	context.clearRect(0, 0, canvas.width | 0, canvas.height | 0);

	const colour = clear[1] as RGB | undefined;
	context.fillStyle = colour ? getRGB(colour) : "black";
	context.fillRect(0, 0, canvas.width | 0, canvas.height | 0);
}

// tslint:disable-next-line:readonly-keyword
const canvasCache: { [_wh: string]: Target | null | undefined } = {};

function renderRenderTarget({ canvas, context, assets }: Target, [_, dst, frames, size]: RenderTarget): void {
	const width = (size == null ? dst.width : size.x) | 0;
	const height = (size == null ? dst.height : size.y) | 0;
	const key = `${width}${height}`;

	let targetCanvas = canvasCache[key];
	canvasCache[key] = null;
	if (targetCanvas == null) {
		const newCanvas = document.createElement("canvas");
		newCanvas.width = (size == null ? dst.width : size.x) | 0;
		newCanvas.height = (size == null ? dst.height : size.y) | 0;
		targetCanvas = { canvas: newCanvas, context: newCanvas.getContext("2d")!, assets };
	}

	renderToCanvas(targetCanvas, frames);
	context.drawImage(targetCanvas.canvas, dst.x | 0, dst.y | 0, dst.width | 0, dst.height | 0);
	canvasCache[key] = targetCanvas;
}

function getRGBA(colour: RGB & { a?: number }): string {
	return colour.a != null ? `rgba(${colour.r | 0}, ${colour.g | 0}, ${colour.b | 0}, ${colour.a})` : getRGB(colour);
}

function getRGB(colour: RGB): string {
	return `rgb(${colour.r | 0}, ${colour.g | 0}, ${colour.b | 0})`;
}
