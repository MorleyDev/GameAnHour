import { mainSdl } from "./main.sdl";
import { App } from "./App";
import { EventHandler } from "./events/eventhandler.service";
import { mainHtml } from "./main.html";

export function main(App: new (events: EventHandler) => App): App {
	if (typeof document !== "undefined") {
		const existingCanvas = document.getElementById("render-target") as HTMLCanvasElement | undefined;
		if (existingCanvas != null) {
			return mainHtml(existingCanvas, App);
		}

		const newCanvas = document.createElement("canvas");
		newCanvas.width = 640;
		newCanvas.height = 480;
		document.body.appendChild(newCanvas);
		return mainHtml(newCanvas, App);
	} else {
		return mainSdl(App);
	}
}
