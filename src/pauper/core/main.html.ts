import { App } from "./App";
import { AppConstructor } from "./App.constructor";
import { HtmlElementEventHandlerImpl } from "./events/htmlelement-eventhandler.service";
import { CanvasRenderer } from "./graphics/canvas-renderer.service";
import { Milliseconds } from "./models/time.model";

export function mainHtml(canvas: HTMLCanvasElement, App: AppConstructor): App {
	let shutdown = false;
	function requestAnimationFrameLoop(logic: () => void, framerate: Milliseconds, maxTime?: Milliseconds): void {
		maxTime = maxTime || framerate;

		let prevTime: Milliseconds = new Date().valueOf();
		(function _tick(): void {
			const startTime: Milliseconds = new Date().valueOf();
			let updateTime: Milliseconds = Math.min(maxTime, startTime - prevTime);
			prevTime = startTime - updateTime;

			while (updateTime >= framerate) {
				prevTime = prevTime + framerate;
				updateTime = updateTime - framerate;
				logic();
			}

			if (!shutdown) {
				requestAnimationFrame(_tick);
			}
		})();
	}

	const canvasRenderer = new CanvasRenderer(canvas);
	const eventHandler = new HtmlElementEventHandlerImpl(window);

	const app = new App(eventHandler, () => { shutdown = true; canvas.remove(); });
	requestAnimationFrameLoop(() => app.update(0.01), 10, 10);
	requestAnimationFrameLoop(() => app.draw(canvasRenderer), 1);
	return app;
}
