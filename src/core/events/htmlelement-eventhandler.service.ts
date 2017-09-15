import { EventHandler, KeyHandler } from "./eventhandler.service";

export class HtmlElementEventHandlerImpl implements EventHandler {
	private readonly events = {
		keyDown: [] as KeyHandler[],
		keyUp: [] as KeyHandler[]
	};

	constructor() {
		window.addEventListener("keydown", ev => this.events.keyDown.forEach(kd => kd(ev.keyCode)));
		window.addEventListener("keyup", ev => this.events.keyUp.forEach(kd => kd(ev.keyCode)));
	}

	public onKeyDown(handler: KeyHandler): this {
		this.events.keyDown.push(handler);
		return this;
	}

	public onKeyUp(handler: KeyHandler): this {
		this.events.keyUp.push(handler);
		return this;
	}
}