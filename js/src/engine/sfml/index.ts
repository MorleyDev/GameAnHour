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

function sfmlKeyToKeyCode(key: number): Key {
	switch (key) {
		case sfml.input.keys.A: return Key.A;
		case sfml.input.keys.B: return Key.B;
		case sfml.input.keys.C: return Key.C;
		case sfml.input.keys.D: return Key.D;
		case sfml.input.keys.E: return Key.E;
		case sfml.input.keys.F: return Key.F;
		case sfml.input.keys.G: return Key.G;
		case sfml.input.keys.H: return Key.H;
		case sfml.input.keys.I: return Key.I;
		case sfml.input.keys.J: return Key.J;
		case sfml.input.keys.K: return Key.K;
		case sfml.input.keys.L: return Key.L;
		case sfml.input.keys.M: return Key.M;
		case sfml.input.keys.N: return Key.N;
		case sfml.input.keys.O: return Key.O;
		case sfml.input.keys.P: return Key.P;
		case sfml.input.keys.Q: return Key.Q;
		case sfml.input.keys.R: return Key.R;
		case sfml.input.keys.S: return Key.S;
		case sfml.input.keys.T: return Key.T;
		case sfml.input.keys.U: return Key.U;
		case sfml.input.keys.V: return Key.V;
		case sfml.input.keys.W: return Key.W;
		case sfml.input.keys.X: return Key.X;
		case sfml.input.keys.Y: return Key.Y;
		case sfml.input.keys.Z: return Key.Z;
		case sfml.input.keys.Num0: return Key.Zero;
		case sfml.input.keys.Num1: return Key.One;
		case sfml.input.keys.Num2: return Key.Two;
		case sfml.input.keys.Num3: return Key.Three;
		case sfml.input.keys.Num4: return Key.Four;
		case sfml.input.keys.Num5: return Key.Five;
		case sfml.input.keys.Num6: return Key.Six;
		case sfml.input.keys.Num7: return Key.Seven;
		case sfml.input.keys.Num8: return Key.Eight;
		case sfml.input.keys.Num9: return Key.Nine;
		case sfml.input.keys.Escape: return Key.Escape;
		case sfml.input.keys.LSystem: return Key.LeftWindowKey;
		case sfml.input.keys.RSystem: return Key.RightWindowKey;
		case sfml.input.keys.LBracket: return Key.OpenBracket;
		case sfml.input.keys.RBracket: return Key.ClosedBracket;
		case sfml.input.keys.SemiColon: return Key.SemiColon;
		case sfml.input.keys.Comma: return Key.Comma;
		case sfml.input.keys.Period: return Key.Period;
		case sfml.input.keys.Quote: return Key.Quote;
		case sfml.input.keys.Slash: return Key.ForwardSlash;
		// case sfml.input.keys.BackSlash: return Key.;
		case sfml.input.keys.Tilde: return Key.Tilde;
		case sfml.input.keys.Equal: return Key.Equals;
		case sfml.input.keys.Dash: return Key.Dash;
		case sfml.input.keys.Space: return Key.Space;
		case sfml.input.keys.Return: return Key.Enter;
		case sfml.input.keys.BackSpace: return Key.Backspace;
		case sfml.input.keys.Tab: return Key.Tab;
		case sfml.input.keys.PageUp: return Key.PageUp;
		case sfml.input.keys.PageDown: return Key.PageDown;
		case sfml.input.keys.End: return Key.End;
		case sfml.input.keys.Home: return Key.Home;
		case sfml.input.keys.Insert: return Key.Insert;
		case sfml.input.keys.Delete: return Key.Delete;
		case sfml.input.keys.Add: return Key.Add;
		case sfml.input.keys.Subtract: return Key.Subtract;
		case sfml.input.keys.Multiply: return Key.Multiply;
		case sfml.input.keys.Divide: return Key.Divide;
		case sfml.input.keys.Left: return Key.LeftArrow;
		case sfml.input.keys.Right: return Key.RightArrow;
		case sfml.input.keys.Up: return Key.UpArrow;
		case sfml.input.keys.Down: return Key.DownArrow;
		case sfml.input.keys.Numpad0: return Key.Numpad0;
		case sfml.input.keys.Numpad1: return Key.Numpad1;
		case sfml.input.keys.Numpad2: return Key.Numpad2;
		case sfml.input.keys.Numpad3: return Key.Numpad3;
		case sfml.input.keys.Numpad4: return Key.Numpad4;
		case sfml.input.keys.Numpad5: return Key.Numpad5;
		case sfml.input.keys.Numpad6: return Key.Numpad6;
		case sfml.input.keys.Numpad7: return Key.Numpad7;
		case sfml.input.keys.Numpad8: return Key.Numpad8;
		case sfml.input.keys.Numpad9: return Key.Numpad9;
		case sfml.input.keys.F1: return Key.F1;
		case sfml.input.keys.F2: return Key.F2;
		case sfml.input.keys.F3: return Key.F3;
		case sfml.input.keys.F4: return Key.F4;
		case sfml.input.keys.F5: return Key.F5;
		case sfml.input.keys.F6: return Key.F6;
		case sfml.input.keys.F7: return Key.F7;
		case sfml.input.keys.F8: return Key.F8;
		case sfml.input.keys.F9: return Key.F9;
		case sfml.input.keys.F10: return Key.F10;
		case sfml.input.keys.F11: return Key.F11;
		case sfml.input.keys.F12: return Key.F12;
		// case sfml.input.keys.F13: return Key.F13;
		// case sfml.input.keys.F14: return Key.F14;
		// case sfml.input.keys.F15: return Key.F15;
		case sfml.input.keys.Pause: return Key.PauseBreak;
		default:
			return 0;
		// case sfml.input.keys.Menu: ;
		// case sfml.input.keys.LControl: ;
		// case sfml.input.keys.LShift: ;
		// case sfml.input.keys.LAlt: ;
		// case sfml.input.keys.RControl: ;
		// case sfml.input.keys.RShift: ;
		// case sfml.input.keys.RAlt: ;
	}
}
engine.hotreload.onStash(() => JSON.stringify(nextState));
engine.hotreload.receive$.subscribe(state => hotreload.next(JSON.parse(state)));
