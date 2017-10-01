import { fromEvent } from "rxjs/observable/fromEvent";
import { Observable } from "rxjs/Observable";
import { map } from "rxjs/operator/map";
import { Subject } from "rxjs/Subject";

import { Key } from "../models/keys.model";
import { EventHandler } from "./eventhandler.service";

export class HtmlElementEventHandlerImpl implements EventHandler {
	constructor(private source: Document | Window | HTMLElement) {
	}

	public keyDown(): Observable<Key> {
		return map.call(fromEvent(this.source, "keydown"), (e: KeyboardEvent) => e.keyCode);
	}
	public keyUp(): Observable<Key> {
		return map.call(fromEvent(this.source, "keyup"), (e: KeyboardEvent) => e.keyCode);
	}
}
