import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

import { Key } from "../models/keys.model";
import { EventHandler } from "./eventhandler.service";

interface EventSource {
	addEventListener(type: "keydown", listener: (event: KeyboardEvent) => any, useCapture?: boolean): void;
	addEventListener(type: "keyup", listener: (event: KeyboardEvent) => any, useCapture?: boolean): void;
}

export class HtmlElementEventHandlerImpl implements EventHandler {
	private readonly events = {
		keyDown: new Subject<Key>(),
		keyUp: new Subject<Key>(),
	};

	constructor(source: EventSource) {
		source.addEventListener("keydown", ev => this.events.keyDown.next(ev.keyCode));
		source.addEventListener("keyup", ev => this.events.keyUp.next(ev.keyCode));
	}

	public keyDown(): Observable<Key> {
		return this.events.keyDown;
	}
	public keyUp(): Observable<Key> {
		return this.events.keyUp;
	}
}