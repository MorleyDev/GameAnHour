import { App } from "./App";
import { CanvasRenderer } from "./graphics/canvas-renderer.service";
import { EventHandler } from "./events/eventhandler.service";
import { HtmlElementEventHandlerImpl } from "./events/htmlelement-eventhandler.service";

export function main(App: new (events: EventHandler) => App): void {
	const canvas = document.getElementById("render-target") as HTMLCanvasElement;
	canvas.width = 640;
	canvas.height = 480;

	const canvasRenderer = new CanvasRenderer(canvas);
	const eventHandler = new HtmlElementEventHandlerImpl(window);

	const app = new App(eventHandler);

	let prevTimeMs = new Date().valueOf();
	(function _update(): void {
		const currTimeMs = new Date().valueOf();
		let updateTime = Math.min(100, currTimeMs - prevTimeMs);
		prevTimeMs = currTimeMs - updateTime;

		while (updateTime >= 10) {
			prevTimeMs = prevTimeMs + 10;
			updateTime = updateTime - 10;
			app.update(0.01);
		}
		requestAnimationFrame(_update);
	})();

	(function _draw(): void {
		app.draw(canvasRenderer);
		requestAnimationFrame(_draw);
	})();
}
