import { EventHandler, KeyHandler } from "./eventhandler.service";

interface EventSource {
	addEventListener(type: "keydown", listener: (event: KeyboardEvent) => any, useCapture?: boolean): void;
	addEventListener(type: "keyup", listener: (event: KeyboardEvent) => any, useCapture?: boolean): void;
}

export class HtmlElementEventHandlerImpl implements EventHandler {
	private readonly events = {
		keyDown: [] as KeyHandler[],
		keyUp: [] as KeyHandler[]
	};

	constructor(source: EventSource) {
		source.addEventListener("keydown", ev => this.events.keyDown.forEach(kd => kd(ev.keyCode)));
		source.addEventListener("keyup", ev => this.events.keyUp.forEach(kd => kd(ev.keyCode)));
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