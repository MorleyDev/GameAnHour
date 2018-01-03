import "@babel/polyfill";

import *  as React from "react";

import { Frame, FrameCollection } from "@morleydev/pauper/render/render-frame.model";
import { map, merge, scan } from "rxjs/operators";
import { matterJsPhysicsEcsEvents, matterJsPhysicsReducer } from "@morleydev/pauper/physics/_inner/matterEngine";

import { AppDrivers } from "@morleydev/pauper/app-drivers";
import { EntitiesState } from "@morleydev/pauper/ecs/entities.state";
import { Game } from "../../main/game-render";
import { GameAction } from "../../main/game-action";
import { GameApp } from "../../main/GameApp";
import { GameState } from "../../main/game-state";
import { GenericAction } from "@morleydev/pauper/redux/generic.action";
import { HtmlDocumentKeyboard } from "@morleydev/pauper/input/HtmlDocumentKeyboard";
import { HtmlElementMouse } from "@morleydev/pauper/input/HtmlElementMouse";
import { PhysicsUpdateResult } from "@morleydev/pauper/physics/update.model";
import { ReactRenderer } from "@morleydev/pauper/render/jsx/render";
import { SpecificReducer } from "@morleydev/pauper/redux/reducer.type";
import { Subscription } from "rxjs/Subscription";
import { WebAssetLoader } from "@morleydev/pauper/assets/web-asset-loader.service";
import { WebAudioService } from "@morleydev/pauper/audio/web-audio.service";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { async } from "rxjs/scheduler/async";
import { bootstrap } from "../../main/game-bootstrap";
import { concat } from "rxjs/observable/concat";
import { createReducer } from "../../main/game-reducer";
import { initialState } from "../../main/game-initial-state";
import { interval } from "rxjs/observable/interval";
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

const drivers = {
	keyboard: new HtmlDocumentKeyboard(document),
	mouse: new HtmlElementMouse(canvas),
	audio: new WebAudioService(),
	loader: new WebAssetLoader(),
	framerates: {
		logicalRender: 20,
		logicalTick: 20
	},
	physics: {
		events: matterJsPhysicsEcsEvents,
		reducer: matterJsPhysicsReducer
	},
	schedulers: {
		logical: async,
		graphics: animationFrame
	}
};

const assets = new WebAssetLoader();
const renderer = new ReactRenderer(<GameApp drivers={drivers as any} initialState={initialState} />);

requestAnimationFrame(function draw() {
	const frame: FrameCollection = renderer.frame() as FrameCollection;
	renderToCanvas({ canvas, context, assets }, frame);
	requestAnimationFrame(draw);
});
