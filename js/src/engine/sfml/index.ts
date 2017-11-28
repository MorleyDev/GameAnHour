import "@babel/polyfill";

import { ReplaySubject } from "rxjs/ReplaySubject";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { of } from "rxjs/observable/of";
import { auditTime, distinctUntilChanged, ignoreElements, reduce, scan, switchMap, tap, concat } from "rxjs/operators";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { async } from "rxjs/scheduler/async";
import { Subject } from "rxjs/Subject";

import { AssetDrivers, getLogicalScheduler, InputDrivers, PhysicsDrivers, SchedulerDrivers } from "@morleydev/pauper/app-drivers";
import { sfml, SfmlEventType } from "@morleydev/pauper/engine/sfml";
import { engine } from "@morleydev/pauper/engine/engine";
import { SfmlAssetLoader } from "@morleydev/pauper/assets/sfml-asset-loader.service";
import { SfmlAudioService } from "@morleydev/pauper/audio/sfml-audio.service";
import { SubjectKeyboard } from "@morleydev/pauper/input/SubjectKeyboard";
import { SubjectMouse } from "@morleydev/pauper/input/SubjectMouse";
import { Key } from "@morleydev/pauper/models/keys.model";
import { box2dPhysicsEcsEvents, box2dPhysicsReducer } from "@morleydev/pauper/physics/_inner/box2dEngine";
import { profile, stats, statDump } from "@morleydev/pauper/profiler";
import { FrameCollection } from "@morleydev/pauper/render/render-frame.model";
import { renderToSfml } from "@morleydev/pauper/render/render-to-sfml.func";
import { safeBufferTime } from "@morleydev/pauper/rx-operators/safeBufferTime";

import { bootstrap } from "../../main/game-bootstrap";
import { epic } from "../../main/game-epic";
import { initialState } from "../../main/game-initial-state";
import { postprocess, reducer } from "../../main/game-reducer";
import { render } from "../../main/game-render";
import { GameAction, GameState } from "../../main/game.model";

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

const r = reducer(drivers as PhysicsDrivers);
const g = {
	render: render(),
	postprocess,
	reducer: r,
	epic: epic(drivers as PhysicsDrivers & InputDrivers & AssetDrivers),
	initialState,
	bootstrap: bootstrap(drivers as AssetDrivers),
};

const postProcessSubject = new Subject<GameAction>();
const subject = new Subject<GameAction>();

const bootstrap$ = g.bootstrap.pipe(
	tap((action: GameAction) => subject.next(action)),
	ignoreElements()
);

const epicActions$ = g.epic(merge(subject, postProcessSubject)).pipe(
	tap((action: GameAction) => subject.next(action)),
	ignoreElements()
);

const fastScan: (reducer: (state: GameState, action: GameAction) => GameState, initialState: GameState) => (input: Observable<GameAction>) => Observable<GameState> =
	(reducer, initialState) => {
		const applyAction = (state: GameState, action: GameAction): GameState => {
			return profile(action.type, () => reducer(state, action));
		};
		const applyActions = (state: GameState, actions: ReadonlyArray<GameAction>) => actions.reduce(applyAction, state);

		return self => self.pipe(
			safeBufferTime(drivers.framerates.logicalTick, getLogicalScheduler(drivers as SchedulerDrivers)),
			scan(applyActions, initialState),
			distinctUntilChanged()
		);
	};

const applyAction = (state: GameState, action: GameAction): GameState => {
	const nexGameState = g.reducer(state, action);
	const { state: newState, actions: followup } = g.postprocess(nexGameState);
	return followup
		.map((action: GameAction) => {
			postProcessSubject.next(action);
			return action;
		})
		.reduce(applyAction, newState);
};

const hotreload = new ReplaySubject<GameState>(1);
let prevState: GameState | null = null;
let nextState: GameState = initialState;
const app$ = g.bootstrap.pipe(
	reduce((state: GameState, action: GameAction) => g.reducer(state, action), g.initialState),
	concat(hotreload),
	switchMap(initialState => merge(epicActions$, subject, of({ type: "@@INIT" } as GameAction)).pipe(
		fastScan(applyAction, initialState),
		auditTime(drivers.framerates.logicalRender, getLogicalScheduler(drivers as SchedulerDrivers)),
		tap(currentState => nextState = currentState),
	))
);
const sub = app$.subscribe(
	() => { },
	(err: Error) => { console.error(`${err.name}: ${err.message}\n${err.stack}`); },
	() => { }
);

let nextFrame: FrameCollection = [];
requestAnimationFrame(function doRender() {
	if (prevState !== nextState) {
		prevState = nextState;
		nextFrame = profile("Render::State->Frame", () => g.render(nextState));
	}
	profile("Render::Frame->Eff(SFML)", () => renderToSfml(drivers.loader, nextFrame));
	requestAnimationFrame(doRender);
});

requestAnimationFrame(function poll() {
	profile("FlushEvents::Sfml->Eff", () => {
		sfml.input.pullEvents().forEach(event => {
		switch (event.type) {
			case SfmlEventType.Closed:
				sfml.close();
				sub.unsubscribe();
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
