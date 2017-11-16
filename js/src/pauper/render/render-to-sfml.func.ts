import { RGBA, RGB } from "../models/colour.model";
import { Circle, Rectangle, Text2 } from "../models/shapes.model";
import { Blit, Clear, Fill, Frame, FrameCollection, FrameCommandType, Origin, RenderTarget, Rotate, Scale, Stroke } from "./render-frame.model";
import { AssetLoader } from "../assets/asset-loader.service";

export function renderToSfml(assets: AssetLoader, frame: FrameCollection): void {
	frame.forEach(command => RenderCommand(assets, command));
}

function RenderCommand(assets: AssetLoader, command: Frame): void {
	const commandType = command[0];
	if (!Array.isArray(commandType)) {
		switch (commandType) {
			case FrameCommandType.Clear:
				return renderClear(assets, command as Clear);

			case FrameCommandType.Origin:
				return renderOrigin(assets, command as Origin);

			case FrameCommandType.RenderTarget:
				return renderRenderTarget(assets, command as RenderTarget);

			case FrameCommandType.Rotate:
				return renderRotate(assets, command as Rotate);

			case FrameCommandType.Scale:
				return renderScale(assets, command as Scale);

			case FrameCommandType.Fill:
				return renderFill(assets, command as Fill);

			case FrameCommandType.Stroke:
				return renderStroke(assets, command as Stroke);

			case FrameCommandType.Blit:
				return renderBlit(assets, command as Blit);
		}
	} else {
		return (command as FrameCollection).forEach(cmd => RenderCommand(assets, cmd));
	}
}

function renderOrigin(assets: AssetLoader, command: Origin): void {
	const origin = command[1];
	const children = command[2];
	SFML_Push_Translate(origin.x | 0, origin.y | 0);
	renderToSfml(assets, children);
	SFML_Pop();
}

function renderRotate(assets: AssetLoader, command: Rotate): void {
	const rotation = command[1];
	const children = command[2];
	SFML_Push_Rotate(rotation);
	renderToSfml(assets, children);
	SFML_Pop();
}

function renderScale(assets: AssetLoader, command: Scale): void {
	const scale = command[1];
	const children = command[2];
	SFML_Push_Scale(scale.x, scale.y);
	renderToSfml(assets, children);
	SFML_Pop();
}

function renderBlit(assets: AssetLoader, command: Blit): void {
	const image = command[1];
	const dst = command[2];
	const src = command[3] as Rectangle | undefined;
	const imgAsset = assets.getImage(image) as { readonly width: number; readonly height: number; readonly name: string  };

	if (Rectangle.is(dst)) {
		if (src != null) {
			SFML_Blit(imgAsset.name, src.x | 0, src.y | 0, src.width | 0, src.height | 0, dst.x, dst.y, dst.width, dst.height);
		} else {
			SFML_Blit(imgAsset.name, 0, 0, imgAsset.width, imgAsset.height, dst.x, dst.y, dst.width, dst.height);
		}
	} else {
		SFML_Blit(imgAsset.name, 0, 0, imgAsset.width, imgAsset.height, dst.x, dst.y, imgAsset.width, imgAsset.height);
	}
}

function renderFill(assets: AssetLoader, fill: Fill): void {
	const shape = fill[1];
	const colour = fill[2] as RGB & { a?: number };

	if (Array.isArray(shape)) {
		if (shape.length === 3) {
			SFML_Fill_Triangle(shape[0].x, shape[0].y, shape[1].x, shape[1].y, shape[2].x, shape[2].y, colour.r, colour.g, colour.b, colour.a == null ? 1 : colour.a);
		} else {
			SFML_Draw_Line(shape[0].x, shape[0].y, shape[1].x, shape[1].y, colour.r, colour.g, colour.b, colour.a == null ? 1 : colour.a);
		}
	} else if (Text2.is(shape)) {
		SFML_Fill_Text(shape.fontFamily || "default", shape.text, shape.fontSize || 30, shape.x, shape.y, colour.r, colour.g, colour.b, colour.a == null ? 1 : colour.a);
	} else if (Rectangle.is(shape)) {
		SFML_Fill_Rectangle(shape.x, shape.y, shape.width, shape.height, colour.r, colour.g, colour.b, colour.a == null ? 1 : colour.a);
	} else if (Circle.is(shape)) {
		SFML_Fill_Circle(shape.x, shape.y, shape.radius, colour.r, colour.g, colour.b, colour.a == null ? 1 : colour.a);
	}
}

function renderStroke(assets: AssetLoader, fill: Stroke): void {
	const shape = fill[1];
	const colour = fill[2] as RGB & { a?: number };

	if (Array.isArray(shape)) {
		if (shape.length === 3) {
			SFML_Stroke_Triangle(shape[0].x, shape[0].y, shape[1].x, shape[1].y, shape[2].x, shape[2].y, colour.r, colour.g, colour.b, colour.a == null ? 1 : colour.a);
		} else {
			SFML_Draw_Line(shape[0].x, shape[0].y, shape[1].x, shape[1].y, colour.r, colour.g, colour.b, colour.a == null ? 1 : colour.a);
		}
	} else if (Text2.is(shape)) {
		SFML_Stroke_Text(shape.fontFamily || "default", shape.text, shape.fontSize || 30, shape.x, shape.y, colour.r, colour.g, colour.b, colour.a == null ? 1 : colour.a);
	} else if (Rectangle.is(shape)) {
		SFML_Stroke_Rectangle(shape.x, shape.y, shape.width, shape.height, colour.r, colour.g, colour.b, colour.a == null ? 1 : colour.a);
	} else if (Circle.is(shape)) {
		SFML_Stroke_Circle(shape.x, shape.y, shape.radius, colour.r, colour.g, colour.b, colour.a == null ? 1 : colour.a);
	}
}

function renderClear(assets: AssetLoader, clear: Clear): void {
	const colour = (clear[1] as RGB | undefined) || RGB(0, 0, 0);

	SFML_Clear(colour.r, colour.g, colour.b);
}


function renderRenderTarget(assets: AssetLoader, [_, dst, frames, size]: RenderTarget): void {
	// TODO
}
