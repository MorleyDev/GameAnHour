import { fromEvent } from "rxjs/observable/fromEvent";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

import { Key } from "../models/keys.model";
import { EventHandler } from "./eventhandler.service";

export class HtmlElementEventHandlerImpl implements EventHandler {
	constructor(private source: Document | Window | HTMLElement) {
	}

	public keyDown(): Observable<Key> {
		return fromEvent(this.source, "keydown");
	}
	public keyUp(): Observable<Key> {
		return fromEvent(this.source, "keyup");
	}
}
