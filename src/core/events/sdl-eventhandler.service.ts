import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

import { Key } from "../models/keys.model";
import { EventHandler } from "./eventhandler.service";

export class SdlEventHandlerImpl implements EventHandler {
	constructor() {
	}

	public keyDown(): Observable<Key> {
		return new Subject<Key>();
	}
	public keyUp(): Observable<Key> {
		return new Subject<Key>();
	}
}
