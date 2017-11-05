import { Colour } from "../models/colour.model";
import { Circle, Rectangle, Text2 } from "../models/shapes.model";
import { Blit, Clear, Fill, Frame, FrameCollection, Origin, RenderTarget, Rotate, Scale, Stroke } from "./render-frame.model";

// Canvas operations break all the rules!
// tslint:disable:no-expression-statement
// tslint:disable:no-object-mutation
// tslint:disable:no-let
// tslint:disable:prefer-for-of

export function renderToSfml(frame: FrameCollection): void {
	for (let i = 0; i < frame.length; ++i) {
		RenderCommand(frame[i]);
	}
	frame.forEach((command: Frame) => RenderCommand(command));
}

function RenderCommand(command: Frame): void {
	const commandType = command[0];
	if (Array.isArray(commandType)) {
		return renderToSfml(command as FrameCollection);
	} else {
		switch (commandType) {
			case "clear":
				return renderClear(command as Clear);

			case "origin":
				return renderOrigin(command as Origin);

			case "rendertarget":
				return renderRenderTarget(command as RenderTarget);

			case "rotate":
				return renderRotate(command as Rotate);

			case "scale":
				return renderScale(command as Scale);

			case "fill":
				return renderFill(command as Fill);

			case "stroke":
				return renderStroke(command as Stroke);

			case "blit":
				return renderBlit(command as Blit);
		}
	}
}

function renderOrigin(command: Origin): void {
	const origin = command[1];
	const children = command[2];
	SFML_Push_Translate(origin.x | 0, origin.y | 0);
	renderToSfml(children);
	SFML_Pop();
}

function renderRotate(command: Rotate): void {
	const rotation = command[1];
	const children = command[2];
	SFML_Push_Rotate(rotation);
	renderToSfml(children);
	SFML_Pop();
}

function renderScale(command: Scale): void {
	const scale = command[1];
	const children = command[2];
	SFML_Push_Scale(scale.x, scale.y);
	renderToSfml(children);
	SFML_Pop();
}

function renderBlit(command: Blit): void {
	const image = command[1];
	const dst = command[2];
	const src = command[3] as Rectangle | undefined;

	if (Rectangle.is(dst)) {
		if (src != null) {
// TODO context.drawImage(image, src.x | 0, src.y | 0, src.width | 0, src.height | 0, dst.x | 0, dst.y | 0, dst.width | 0, dst.height | 0);
		} else {
// TODO context.drawImage(image, dst.x | 0, dst.y | 0, dst.width | 0, dst.height | 0);
		}
	} else {
// TODO context.drawImage(image, dst.x | 0, dst.y | 0);
	}
}

function renderFill(fill: Fill): void {
	const shape = fill[1];
	const colour = fill[2];

	if (Array.isArray(shape)) {
		if (shape.length === 3) {
			SFML_Fill_Triangle(shape[0].x, shape[0].y, shape[1].x, shape[1].y, shape[2].x, shape[2].y, colour.r, colour.g, colour.b, colour.a);
		} else {
			SFML_Draw_Line(shape[0].x, shape[0].y, shape[1].x, shape[1].y, colour.r, colour.g, colour.b, colour.a);
		}
	} else if (Text2.is(shape)) {
		// TODO
	} else if (Rectangle.is(shape)) {
		SFML_Fill_Rectangle(shape.x, shape.y, shape.width, shape.height, colour.r, colour.g, colour.b, colour.a);
	} else if (Circle.is(shape)) {
		SFML_Fill_Circle(shape.x, shape.y, shape.radius, colour.r, colour.g, colour.b, colour.a);
	}
}

function renderStroke(fill: Stroke): void {
	const shape = fill[1];
	const colour = fill[2];

	if (Array.isArray(shape)) {
		if (shape.length === 3) {
			SFML_Stroke_Triangle(shape[0].x, shape[0].y, shape[1].x, shape[1].y, shape[2].x, shape[2].y, colour.r, colour.g, colour.b, colour.a);
		} else {
			SFML_Draw_Line(shape[0].x, shape[0].y, shape[1].x, shape[1].y, colour.r, colour.g, colour.b, colour.a);
		}
	} else if (Text2.is(shape)) {
		// TODO
	} else if (Rectangle.is(shape)) {
		SFML_Stroke_Rectangle(shape.x, shape.y, shape.width, shape.height, colour.r, colour.g, colour.b, colour.a);
	} else if (Circle.is(shape)) {
		SFML_Stroke_Circle(shape.x, shape.y, shape.radius, colour.r, colour.g, colour.b, colour.a);
	}
}

function renderClear(clear: Clear): void {
	const colour = (clear[1] as Colour | undefined) || Colour(0, 0, 0);

	SFML_Clear(colour.r, colour.g, colour.b);
}


function renderRenderTarget([_, dst, frames, size]: RenderTarget): void {
	// TODO
}
