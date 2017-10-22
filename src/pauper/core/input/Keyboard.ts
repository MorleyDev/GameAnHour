import { Key } from "../models/keys.model";
import { Observable } from "rxjs/Observable";

export abstract class Keyboard {
	public abstract keyDown(): Observable<Key>;
	public abstract keyUp(): Observable<Key>;
}
