import { Observable } from "rxjs/Observable";
import { fromEvent } from "rxjs/observable/fromEvent";
import { distinctUntilChanged } from "rxjs/operators/distinctUntilChanged";
import { groupBy } from "rxjs/operators/groupBy";
import { map } from "rxjs/operators/map";
import { merge } from "rxjs/operators/merge";
import { mergeMap } from "rxjs/operators/mergeMap";

import { Key } from "../models/keys.model";
import { Keyboard } from "./Keyboard";

export class CanvasKeyboard implements Keyboard {
	private keydown: Observable<KeyboardEvent>;
	private keyup: Observable<KeyboardEvent>;

	constructor(private canvas: HTMLCanvasElement) {
		this.keydown = fromEvent(document, "keydown");
		this.keyup = fromEvent(document, "keyup");
	}

	public keyDown(): Observable<Key> {
		return this.keydown.pipe(
			map((event: KeyboardEvent) => event.keyCode)
		);
	}

	public keyUp(): Observable<Key> {
		return this.keyup.pipe(
			map((event: KeyboardEvent) => event.keyCode)
		);
	}
}
