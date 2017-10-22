import { Observable } from "rxjs/Observable";

import { MouseButton } from "../models/mouseButton";
import { Point2Type } from "../models/point/point.model.type";

export abstract class Mouse {
	public abstract mouseDown(type?: MouseButton): Observable<Point2Type>;
	public abstract mouseUp(type?: MouseButton): Observable<Point2Type>;
	public abstract mouseMove(): Observable<Point2Type>;
}
