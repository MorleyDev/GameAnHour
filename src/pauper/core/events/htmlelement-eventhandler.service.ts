import { Observable } from "rxjs/Observable";
import { fromEvent } from "rxjs/observable/fromEvent";
import { map } from "rxjs/operators/map";

import { Key } from "../models/keys.model";
import { EventHandler } from "./eventhandler.service";

export class HtmlElementEventHandlerImpl implements EventHandler {
	constructor(private source: Document | Window | HTMLElement) {
	}

	public keyDown(): Observable<Key> {
		return fromEvent(this.source, "keydown").let(map((e: KeyboardEvent) => e.keyCode));
	}
	public keyUp(): Observable<Key> {
		return fromEvent(this.source, "keyup").let(map((e: KeyboardEvent) => e.keyCode));
	}
}
