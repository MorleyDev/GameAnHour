import "@babel/polyfill";

import { merge } from "rxjs/observable/merge";
import { concat, ignoreElements, reduce, tap } from "rxjs/operators";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { async } from "rxjs/scheduler/async";
import { Subject } from "rxjs/Subject";

import { bootstrap } from "../../main/game-bootstrap";
import { epic } from "../../main/game-epic";
import { initialState } from "../../main/game-initial-state";
import { reducer } from "../../main/game-reducer";
import { GameAction, GameState } from "../../main/game.model";
import { AssetDrivers, InputDrivers, PhysicsDrivers } from "@morleydev/pauper/app-drivers";
import { SfmlAssetLoader } from "@morleydev/pauper/assets/sfml-asset-loader.service";
import { SfmlAudioService } from "@morleydev/pauper/audio/sfml-audio.service";
import { SubjectKeyboard } from "@morleydev/pauper/input/SubjectKeyboard";
import { SubjectMouse } from "@morleydev/pauper/input/SubjectMouse";
import { Key } from "@morleydev/pauper/models/keys.model";
import { box2dPhysicsEcsEvents, box2dPhysicsReducer } from "@morleydev/pauper/physics/_inner/box2dEngine";
import { profile, statDump } from "@morleydev/pauper/profiler";
import { FrameCollection } from "@morleydev/pauper/render/render-frame.model";
import { renderToSfml } from "@morleydev/pauper/render/render-to-sfml.func";
import { worker, engine, secondary } from "@morleydev/pauper/engine/engine";
import { sfml, SfmlEventType } from "@morleydev/pauper/engine/sfml";

const drivers = {
	keyboard: new SubjectKeyboard(),
	mouse: new SubjectMouse(),
	audio: new SfmlAudioService(),
	loader: new SfmlAssetLoader(),
	physics: {
		events: box2dPhysicsEcsEvents,
		reducer: box2dPhysicsReducer
	},
	schedulers: {
		logical: async,
		graphics: animationFrame
	}
};

const r = reducer(drivers as PhysicsDrivers);
const g = {
	reducer: r,
	epic: epic(drivers as PhysicsDrivers & AssetDrivers & InputDrivers),
	initialState,
	bootstrap: bootstrap(drivers as AssetDrivers),
};

const actions = new Subject<GameAction>();

const bootstrap$ = g.bootstrap.pipe(
	tap((action: GameAction) => actions.next(action)),
	ignoreElements()
);

const epicActions$ = g.epic(merge(actions)).pipe(
	tap((action: GameAction) => actions.next(action))
);
const epicSub = epicActions$.subscribe(action => {
	secondary.send(JSON.stringify({ type: "action", action }));
});

const hotreloadedState = new ReplaySubject<GameState>(1);

let startingState: GameState | null = null;
const sub = g.bootstrap.pipe(
	reduce((state: GameState, action: GameAction) => g.reducer(state, action), g.initialState),
	concat(hotreloadedState)
).subscribe(state => {
	secondary.send(JSON.stringify({ type: "state", state }));
	startingState = state;
});

secondary.receive$.subscribe((msg: string) => {
	const action: GameAction = JSON.parse(msg);
	actions.next(action);
});

type WorkerEvent = { type: "RenderFrame"; frame: FrameCollection; timestamp: number };
let nextFrame: WorkerEvent = { type: "RenderFrame", frame: [], timestamp: 0 };
worker.receive$.subscribe((msg: string) => {
	const frame: WorkerEvent = JSON.parse(msg);
	if (frame.timestamp > nextFrame.timestamp) {
		nextFrame = frame;
	}
});

requestAnimationFrame(function doRender() {
	profile("Render::Frame->Eff(SFML)", () => renderToSfml(drivers.loader, nextFrame.frame));
	requestAnimationFrame(doRender);
});

requestAnimationFrame(function poll() {
	profile("FlushEvents::Sfml->Eff", () => sfml.input.pullEvents().forEach(event => {
		switch (event.type) {
			case SfmlEventType.Closed:
				sfml.close();
				sub.unsubscribe();
				epicSub.unsubscribe();
				statDump("Primary");
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
	}));
	requestAnimationFrame(poll);
});

engine.hotreload.receive$.subscribe((state: string) => {
	const gameState: GameState | null = JSON.parse(state);
	if (gameState != null) {
		hotreloadedState.next(gameState);
	}
});
engine.hotreload.onStash(() => JSON.stringify(startingState));
