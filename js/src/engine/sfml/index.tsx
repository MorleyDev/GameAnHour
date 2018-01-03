import "@babel/polyfill";

import * as React from "react";

import { AssetDrivers, InputDrivers, PhysicsDrivers, SchedulerDrivers, getLogicalScheduler } from "@morleydev/pauper/app-drivers";
import { SfmlEventType, sfml } from "@morleydev/pauper/engine/sfml";
import { box2dPhysicsEcsEvents, box2dPhysicsReducer } from "@morleydev/pauper/physics/_inner/box2dEngine";
import { map, scan } from "rxjs/operators";
import { profile, statDump, stats } from "@morleydev/pauper/profiler";

import { FrameCollection } from "@morleydev/pauper/render/render-frame.model";
import { Game } from "../../main/game-render";
import { GameAction } from "../../main/game-action";
import { GameApp } from "../../main/GameApp";
import { GameState } from "../../main/game-state";
import { ReactRenderer } from "@morleydev/pauper/render/jsx/render";
import { SfmlAssetLoader } from "@morleydev/pauper/assets/sfml-asset-loader.service";
import { SfmlAudioService } from "@morleydev/pauper/audio/sfml-audio.service";
import { SubjectKeyboard } from "@morleydev/pauper/input/SubjectKeyboard";
import { SubjectMouse } from "@morleydev/pauper/input/SubjectMouse";
import { Subscription } from "rxjs/Subscription";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { async } from "rxjs/scheduler/async";
import { concat } from "rxjs/observable/concat";
import { createReducer } from "../../main/game-reducer";
import { engine } from "@morleydev/pauper/engine/engine";
import { initialState } from "../../main/game-initial-state";
import { interval } from "rxjs/observable/interval";
import { renderToSfml } from "@morleydev/pauper/render/render-to-sfml.func";

const drivers = {
	keyboard: new SubjectKeyboard(),
	mouse: new SubjectMouse(),
	audio: new SfmlAudioService(),
	loader: new SfmlAssetLoader(),
	framerates: {
		logicalRender: 20,
		logicalTick: 20
	},
	physics: {
		events: box2dPhysicsEcsEvents,
		reducer: box2dPhysicsReducer
	},
	schedulers: {
		logical: async,
		graphics: animationFrame
	}
};

requestAnimationFrame(function poll() {
	profile("FlushEvents::Sfml->Eff", () => {
		sfml.input.pullEvents().forEach(event => {
			switch (event.type) {
				case SfmlEventType.Closed:
					sfml.close();
					statDump("Javascript");
					break;
				case SfmlEventType.MouseButtonPressed:
					drivers.mouse.mouseDown$.next([event.button, event.position]);
					break;
				case SfmlEventType.MouseButtonReleased:
					drivers.mouse.mouseUp$.next([event.button, event.position]);
					break;
				case SfmlEventType.MouseMoved:
					drivers.mouse.mouseMove$.next(event.position);
					break;
				case SfmlEventType.KeyPressed:
					drivers.keyboard.keyDown$.next(event.key);
					break;
				case SfmlEventType.KeyReleased:
					drivers.keyboard.keyUp$.next(event.key);
					break;
			}
		});
	});
	requestAnimationFrame(poll);
});

engine.hotreload.receive$.subscribe((state: string) => { });
engine.hotreload.onStash(() => "");

const renderer = new ReactRenderer(<GameApp drivers={drivers as any} initialState={initialState} />);

requestAnimationFrame(function draw() {
	const frame: FrameCollection = renderer.frame() as FrameCollection;
	renderToSfml(drivers.loader, frame);
	requestAnimationFrame(draw);
});
