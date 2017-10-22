import { tap } from "rxjs/operators/tap";
import { Observable } from "rxjs/Observable";
import { fromEvent } from "rxjs/observable/fromEvent";
import { map } from "rxjs/operators/map";

import { MouseButton } from "../models/mouseButton";
import { Point2Type } from "../models/point/point.model.type";
import { Mouse } from "./Mouse";
import { filter } from "rxjs/operators/filter";

export class CanvasMouse implements Mouse {
	constructor(private canvas: HTMLCanvasElement) {
		canvas.oncontextmenu = () => false; // Uuuuuuuuuuuuugly!
	}

	public mouseDown(type: MouseButton): Observable<Point2Type> {
		const buttonCode = this.getMouseKeyCode(type);

		return fromEvent(this.canvas, "mousedown").pipe(
			filter((event: MouseEvent) => event.button === buttonCode),
			map((event: MouseEvent) => ({ x: event.offsetX, y: event.offsetY }))
		);
	}

	public mouseUp(type: MouseButton): Observable<Point2Type> {
		const buttonCode = this.getMouseKeyCode(type);

		return fromEvent(this.canvas, "mouseup").pipe(
			tap((e: MouseEvent) => console.log(e.button)),
			filter((event: MouseEvent) => event.button === buttonCode),
			map((event: MouseEvent) => ({ x: event.offsetX, y: event.offsetY }))
		);
	}

	public mouseMove(): Observable<Point2Type> {
		return fromEvent(this.canvas, "mousemove").pipe(
			map((event: MouseEvent) => ({ x: event.offsetX, y: event.offsetY }))
		);
	}

	private getMouseKeyCode(button: MouseButton): number {
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
}
