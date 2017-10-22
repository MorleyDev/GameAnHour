import { mergeMap } from "rxjs/operators/mergeMap";
import { mergeAll } from "rxjs/operators/mergeAll";
import { distinctUntilChanged } from "rxjs/operators/distinctUntilChanged";
import { groupBy } from "rxjs/operators/groupBy";
import { Observable } from "rxjs/Observable";
import { fromEvent } from "rxjs/observable/fromEvent";
import { map } from "rxjs/operators/map";
import { merge } from "rxjs/operators/merge";

import { Key } from "../models/keys.model";
import { Keyboard } from "./Keyboard";

export class CanvasKeyboard implements Keyboard {
	private keydown: Observable<KeyboardEvent>;
	private keyup: Observable<KeyboardEvent>;

	constructor(private canvas: HTMLCanvasElement) {
		this.keydown = fromEvent(this.canvas, "keydown");
		this.keyup = fromEvent(this.canvas, "keyup");
	}

	public keyDown(): Observable<Key> {
		return this.keydown.pipe(
			merge(this.keyup),
			groupBy(event => event.type),
			mergeMap(key => key.pipe( distinctUntilChanged((l, r) => l === r, k => k.type) )),
			map(key => key.keyCode as Key)
		);
	}

	public keyUp(): Observable<Key> {
		return this.keyup.pipe(
			map((event: KeyboardEvent) => event.keyCode)
		);
	}
}
