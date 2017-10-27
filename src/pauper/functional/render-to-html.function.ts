import { Blit, Fill, Frame, FrameCollection, Origin, Rotate, Scale, Stroke, Clear } from "./render-frame.model";
import { Line2, Triangle2, Circle, Rectangle, Text2, Point2 } from "../core/models/shapes.model";

export function RenderToHtml(frame: FrameCollection): string {
	return `<div style="position: absolute">${frame.reduce((html, command) => html + RenderCommand(command), "")}</div>`;
}

function RenderCommand(command: Frame): string {
	const commandType = command[0];
	if (Array.isArray(commandType)) {
		return RenderToHtml(command as FrameCollection);
	} else {
		switch (commandType) {
			case "clear":
				return RenderClear(command as Clear);

			case "origin":
				return RenderOrigin(command as Origin);

			case "rotate":
				return RenderRotate(command as Rotate);

			case "scale":
				return RenderScale(command as Scale);

			case "fill":
				return RenderFill(command as Fill);

			case "stroke":
				return RenderStroke(command as Stroke);

			case "blit":
				return RenderBlit(command as Blit);

			default:
				return "";
		}
	}
}

function RenderOrigin(command: Origin): string {
	return `<div style="transform: translate(${command[1].x}px, ${command[1].y}px)">${RenderToHtml(command[2])}</div>`
}

function RenderRotate(command: Rotate): string {
	return `<div style="transform: rotateZ(${command[1]})">${RenderToHtml(command[2])}</div>`
}

function RenderScale(command: Scale): string {
	return `<div style="transform: scale(${command[1].x}, ${command[1].y})">${RenderToHtml(command[2])}</div>`
}

function RenderBlit(command: Blit): string {
	return `<div></div>`;
}

function RenderFill(fill: Fill): string {
	const shape = fill[1];
	const colour = fill[2];
	if (Line2.is(shape)) {
		return "";
	} else if (Triangle2.is(shape)) {
		return "";
	} else {
		return `<div style="transform: translate(${shape.x}px, ${shape.y}px)">${RenderFillInner(shape, colour)}</div>`
	}

	function RenderFillInner(shape: Circle | Rectangle | Text2 | Point2, colour: string): string {
		if (Circle.is(shape)) {
			return `
				<div style="transform: translate(${shape.x - shape.radius}px, ${shape.y - shape.radius}px)">
					<div style="width: ${shape.radius * 2}px; height: ${shape.radius * 2}px; border-radius: 100%; background: ${colour}"></div>
				</div>
			`;
		} else if (Rectangle.is(shape)) {
			return `
				<div style="width: ${shape.width}px; height: ${shape.height}px; background: ${colour}"></div>
			`;
		} else if (Text2.is(shape)) {
			return `
				<span style="color: ${colour}; font: ${shape.fontFamily} ${shape.fontSize}">${shape.text}</span>
			`;
		} else {
			return `<div style="width: 1px; height: 1px; background: ${colour}"></div>`;
		}
	}
}

function RenderStroke(fill: Stroke): string {
	const shape = fill[1];
	const colour = fill[2];
	if (Line2.is(shape)) {
		return "";
	} else if (Triangle2.is(shape)) {
		return "";
	} else {
		return `<div style="transform: translate(${shape.x}px, ${shape.y}px)">${RenderFillInner(shape, colour)}</div>`
	}

	function RenderFillInner(shape: Circle | Rectangle | Text2 | Point2, colour: string): string {
		if (Circle.is(shape)) {
			return `
				<div style="transform: translate(${shape.x - shape.radius}px, ${shape.y - shape.radius}px)">
					<div style="width: ${shape.radius * 2}px; height: ${shape.radius * 2}px; border-radius: 100%; border: 1px; border-color: ${colour}"></div>
				</div>
			`;
		} else if (Rectangle.is(shape)) {
			return `
				<div style="width: ${shape.width}px; height: ${shape.height}px; border: 1px; border-color: ${colour}"></div>
			`;
		} else if (Text2.is(shape)) {
			return `
				<span style="color: ${colour}; font: ${shape.fontFamily} ${shape.fontSize}">${shape.text}</span>
			`;
		} else {
			return `<div style="width: 1px; height: 1px; background: ${colour}"></div>`;
		}
	}
}

function RenderClear(clear: Clear): string {
	return (document.body.style.backgroundColor = clear[1] || "black") && "";
}