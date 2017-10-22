import { Observable } from "rxjs/Observable";
import { fromEvent } from "rxjs/observable/fromEvent";
import { filter } from "rxjs/operators/filter";
import { map } from "rxjs/operators/map";

import { MouseButton } from "../models/mouseButton";
import { Point2Type } from "../models/point/point.model.type";
import { Mouse } from "./Mouse";

export class CanvasMouse implements Mouse {
	constructor(private canvas: HTMLCanvasElement) {
		canvas.oncontextmenu = () => false; // Uuuuuuuuuuuuugly!
	}

	public mouseDown(type?: MouseButton): Observable<Point2Type> {
		return fromEvent(this.canvas, "mousedown").pipe(
			filterByMouseButton(type),
			map((event: MouseEvent) => ({ x: event.offsetX, y: event.offsetY }))
		);
	}

	public mouseUp(type?: MouseButton): Observable<Point2Type> {
		return fromEvent(this.canvas, "mouseup").pipe(
			filterByMouseButton(type),
			map((event: MouseEvent) => ({ x: event.offsetX, y: event.offsetY }))
		);
	}

	public mouseMove(): Observable<Point2Type> {
		return fromEvent(this.canvas, "mousemove").pipe(
			map((event: MouseEvent) => ({ x: event.offsetX, y: event.offsetY }))
		);
	}
}

function filterByMouseButton(button?: MouseButton): (e: Observable<MouseEvent>) => Observable<MouseEvent> {
	if (button == null) {
		return event => event;
	}
	const buttonCode = getMouseKeyCode(button);
	return filter((event: MouseEvent) => event.button === buttonCode);
}

function getMouseKeyCode(button: MouseButton): number {
	switch (button) {
		case MouseButton.Left:
			return 0;
		case MouseButton.Middle:
			return 1;
		case MouseButton.Right:
			return 2;
		default:
			return -1;
	}
}
