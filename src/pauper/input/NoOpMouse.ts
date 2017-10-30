import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";

import { MouseButton } from "../models/mouse-button.model";
import { Point2Type } from "../models/point/point.model.type";
import { Mouse } from "./Mouse";
import { Subject } from "rxjs/Subject";

export class NoOpMouse implements Mouse {

	public mouseDown(type?: MouseButton): Observable<Point2Type> {
		return new Subject<Point2Type>();
	}

	public mouseUp(type?: MouseButton): Observable<Point2Type> {
		return new Subject<Point2Type>();
	}

	public mouseMove(): Observable<Point2Type> {
		return new Subject<Point2Type>();
	}
}
