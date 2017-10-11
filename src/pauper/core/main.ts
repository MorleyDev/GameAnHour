import { App } from "./App";
import { AppConstructor } from "./App.constructor";
import { mainHtml } from "./main.html";

export function main(App: AppConstructor): App {
	const existingCanvas = document.getElementById("render-target") as HTMLCanvasElement | undefined;
	if (existingCanvas != null) {
		return mainHtml(existingCanvas, App);
	}

	const newCanvas = document.createElement("canvas");
	newCanvas.width = 640;
	newCanvas.height = 480;
	document.body.appendChild(newCanvas);
	return mainHtml(newCanvas, App);
}