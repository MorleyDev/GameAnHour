import { App } from "./App";
import { EventHandler } from "./events/eventhandler.service";
import { HtmlElementEventHandlerImpl } from "./events/htmlelement-eventhandler.service";
import { CanvasRenderer } from "./graphics/canvas-renderer.service";

export function main(App: new (events: EventHandler) => App): void {
	function requestAnimationFrameLoop(logic: () => void, framerate: number, maxTime?: number): void {
		maxTime = maxTime || framerate;

		let prevTimeMs = new Date().valueOf();
		(function _tick(): void {
			const startTimeMs = new Date().valueOf();
			let updateTime = Math.min(maxTime, startTimeMs - prevTimeMs);
			prevTimeMs = startTimeMs - updateTime;

			while (updateTime >= framerate) {
				prevTimeMs = prevTimeMs + framerate;
				updateTime = updateTime - framerate;
				logic();
			}
			requestAnimationFrame(_tick);
		})();
	}

	const canvas = document.getElementById("render-target") as HTMLCanvasElement;
	const canvasRenderer = new CanvasRenderer(canvas);
	const eventHandler = new HtmlElementEventHandlerImpl(window);

	const app = new App(eventHandler);
	requestAnimationFrameLoop(() => app.update(0.01), 10, 100);
	requestAnimationFrameLoop(() => app.draw(canvasRenderer), 1);
}
