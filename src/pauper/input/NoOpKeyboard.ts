import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

import { Key } from "../models/keys.model";
import { Keyboard } from "./Keyboard";

export class NoOpKeyboard implements Keyboard {
	public keyDown(): Observable<Key> {
		return new Subject<Key>();
	}

	public keyUp(): Observable<Key> {
		return new Subject<Key>();
	}
}
