import { Key } from "../models/keys.model";

export type KeyHandler = (key: Key) => void;

export abstract class EventHandler {
	public abstract onKeyDown(handler: KeyHandler): EventHandler;
	public abstract onKeyUp(handler: KeyHandler): EventHandler;
}
