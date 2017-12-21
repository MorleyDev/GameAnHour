import "@babel/polyfill";

import *  as React from "react";

import { Frame, FrameCollection } from "@morleydev/pauper/render/render-frame.model";

import { Game } from "../../main/game-render";
import { ReactRenderer } from "@morleydev/pauper/render/jsx/render";
import { WebAssetLoader } from "@morleydev/pauper/assets/web-asset-loader.service";
import { renderToCanvas } from "@morleydev/pauper/render/render-to-canvas.func";

const canvas = document.getElementById("render-target") as HTMLCanvasElement | null;
if (canvas == null) {
	throw new Error("Could not find #render-target");

}
const context = canvas.getContext("2d");
if (context == null) {
	throw new Error("Could not acquire 2d rendering context");
}
const element = document.getElementById("canvas-container");
if (element == null) {
	throw new Error("Could not find #canvas-container");
}

const assets = new WebAssetLoader();

const renderer = new ReactRenderer(<Game />);
requestAnimationFrame(function draw() {
	const frame: FrameCollection = renderer.frame() as FrameCollection;
	renderToCanvas({ canvas, context, assets }, frame);
	requestAnimationFrame(draw);
});
