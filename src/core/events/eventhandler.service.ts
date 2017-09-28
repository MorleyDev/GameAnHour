import { Observable } from "rxjs/Observable";

import { Key } from "../models/keys.model";

export type KeyHandler = (key: Key) => void;

export abstract class EventHandler {
	public abstract keyDown(): Observable<Key>;
	public abstract keyUp(): Observable<Key>;
}
