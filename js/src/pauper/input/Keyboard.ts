import { Observable } from "rxjs/Observable";

import { Key } from "../models/keys.model";

export abstract class Keyboard {
	public abstract keyDown(): Observable<Key>;
	public abstract keyUp(): Observable<Key>;
}
