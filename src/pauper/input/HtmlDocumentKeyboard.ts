import { Observable } from "rxjs/Observable";
import { fromEvent } from "rxjs/observable/fromEvent";
import { map } from "rxjs/operators/map";

import { Key } from "../models/keys.model";
import { Keyboard } from "./Keyboard";

export class HtmlDocumentKeyboard implements Keyboard {
	constructor(private document: Document) {
	}

	public keyDown(): Observable<Key> {
		return (fromEvent(this.document, "keydown") as Observable<KeyboardEvent>).pipe(
			map((event: KeyboardEvent) => event.keyCode)
		);
	}

	public keyUp(): Observable<Key> {
		return (fromEvent(this.document, "keyup") as Observable<KeyboardEvent>).pipe(
			map((event: KeyboardEvent) => event.keyCode)
		);
	}
}
