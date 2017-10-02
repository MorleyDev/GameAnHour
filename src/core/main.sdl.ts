import { App } from "./App";
import { AppConstructor } from "./App.constructor";
import { SdlEventHandlerImpl } from "./events/sdl-eventhandler.service";
import { SdlRenderer } from "./graphics/sdl-renderer.service";
import { Milliseconds } from "./models/time.model";

export function mainSdl(App: AppConstructor): App {
	let shutdown: boolean = false;
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
				setTimeout(_tick, framerate);
			}
		})();
	}

	const eventHandler = new SdlEventHandlerImpl();
	const renderer = new SdlRenderer();
	const app = new App(eventHandler, () => { shutdown = true; });
	requestAnimationFrameLoop(() => app.update(0.01), 10, 100);
	requestAnimationFrameLoop(() => app.draw(renderer), 1);
	return app;
}
