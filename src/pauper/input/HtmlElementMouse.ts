import { Observable } from "rxjs/Observable";
import { fromEvent } from "rxjs/observable/fromEvent";
import { filter, map } from "rxjs/operators";

import { MouseButton } from "../models/mouse-button.model";
import { Point2Type } from "../models/point/point.model.type";
import { Mouse } from "./Mouse";

export class HtmlElementMouse implements Mouse {
	constructor(private element: HTMLElement) {
		element.oncontextmenu = () => false; // Uuuuuuuuuuuuugly!
	}

	public mouseDown(type?: MouseButton): Observable<Point2Type> {
		const element = this.element;

		return fromEvent(element, "mousedown").pipe(
			filterByMouseButton(type),
			map((event: MouseEvent) => ({ x: event.offsetX, y: event.offsetY }))
		);
	}

	public mouseUp(type?: MouseButton): Observable<Point2Type> {
		const element = this.element;

		return fromEvent(element, "mouseup").pipe(
			filterByMouseButton(type),
			map((event: MouseEvent) => ({ x: event.offsetX, y: event.offsetY }))
		);
	}

	public mouseMove(): Observable<Point2Type> {
		const element = this.element;

		return fromEvent(element, "mousemove").pipe(
			map((event: {}) => ({ x: (event as MouseEvent).offsetX, y: (event as MouseEvent).offsetY }))
		);
	}
}

function filterByMouseButton(button?: MouseButton): (e: Observable<{}>) => Observable<MouseEvent> {
	if (button == null) {
		return event => event as Observable<MouseEvent>;
	}
	const buttonCode = getMouseKeyCode(button);
	return filter((event: {}) => (event as MouseEvent).button === buttonCode) as (e: Observable<{}>) => Observable<MouseEvent>;
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
