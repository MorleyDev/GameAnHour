import { Observable } from "rxjs/Observable";
import { fromEvent } from "rxjs/observable/fromEvent";
import { map } from "rxjs/operator/map";

import { fcall } from "../extensions/Object.fcall.func";
import { Key } from "../models/keys.model";
import { EventHandler } from "./eventhandler.service";

export class HtmlElementEventHandlerImpl implements EventHandler {
	constructor(private source: Document | Window | HTMLElement) {
	}

	public keyDown(): Observable<Key> {
		return fcall(fromEvent(this.source, "keydown"), map, (e: KeyboardEvent) => e.keyCode) as Observable<Key>;
	}
	public keyUp(): Observable<Key> {
		return fcall(fromEvent(this.source, "keyup"), map, (e: KeyboardEvent) => e.keyCode) as Observable<Key>;
	}
}
