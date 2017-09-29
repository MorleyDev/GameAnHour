import { App } from "./App";
import { EventHandler } from "./events/eventhandler.service";
import { HtmlElementEventHandlerImpl } from "./events/htmlelement-eventhandler.service";
import { CanvasRenderer } from "./graphics/canvas-renderer.service";
import { Milliseconds } from "./models/time.model";

export function main(App: new (events: EventHandler) => App): void {
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
