import "@babel/polyfill";

import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { of } from "rxjs/observable/of";
import { auditTime, concat, distinctUntilChanged, ignoreElements, reduce, scan, switchMap, tap } from "rxjs/operators";
import { Subject } from "rxjs/Subject";
import { ReplaySubject } from "rxjs/ReplaySubject";

import { bootstrap } from "../../main/game-bootstrap";
import { epic } from "../../main/game-epic";
import { initialState } from "../../main/game-initial-state";
import { postprocess, reducer } from "../../main/game-reducer";
import { render } from "../../main/game-render";
import { GameAction, GameState } from "../../main/game.model";
import { AppDrivers, getLogicalScheduler } from "../../pauper/app-drivers";
import { SfmlAssetLoader } from "../../pauper/assets/sfml-asset-loader.service";
import { SfmlAudioService } from "../../pauper/audio/sfml-audio.service";
import { SubjectKeyboard } from "../../pauper/input/SubjectKeyboard";
import { SubjectMouse } from "../../pauper/input/SubjectMouse";
import { Key } from "../../pauper/models/keys.model";
import { box2dPhysicsEcsEvents, box2dPhysicsReducer } from "../../pauper/physics/_inner/box2dEngine";
import { profile, stats, statDump } from "../../pauper/profiler";
import { FrameCollection } from "../../pauper/render/render-frame.model";
import { renderToSfml } from "../../pauper/render/render-to-sfml.func";
import { safeBufferTime } from "../../pauper/rx-operators/safeBufferTime";

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
	}
};

const r = reducer(drivers as AppDrivers);
const g = {
	render: render(),
	postprocess,
	reducer: r,
	epic: epic(drivers as AppDrivers),
	initialState,
	bootstrap: bootstrap(drivers as AppDrivers),
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
			safeBufferTime(drivers.framerates.logicalTick, getLogicalScheduler(drivers as AppDrivers)),
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

const hotreloadedState = new ReplaySubject<GameState>(1);

let prevState: GameState | null = null;
const app$ = bootstrap(drivers as AppDrivers).pipe(
	reduce((state: GameState, action: GameAction) => g.reducer(state, action), initialState),
	concat(hotreloadedState),
	switchMap(initialState => merge(epicActions$, subject, of({ type: "@@INIT" } as GameAction)).pipe(
		fastScan(applyAction, initialState),
		auditTime(drivers.framerates.logicalRender, getLogicalScheduler(drivers as AppDrivers)),
		tap(currentState => {
			if (prevState !== currentState) {
				WORKER_Emit(JSON.stringify({ type: "RenderStateToFrame", state: currentState, timestamp: Date.now() }));
				prevState = currentState;
			}
		}),
	))
);
const sub = app$.subscribe(
	() => { },
	(err: Error) => { console.error(`${err.name}: ${err.message}\n${err.stack}`); },
	() => { }
);

type WorkerEvent = {
	type: "RenderFrame";
	frame: FrameCollection;
	timestamp: number;
};
let nextFrame: WorkerEvent = { type: "RenderFrame", frame: [], timestamp: 0 };
WORKER_Receive = (msg: string) => {
	const frame: WorkerEvent = JSON.parse(msg);
	if (frame.timestamp > nextFrame.timestamp) {
		nextFrame = frame;
	}
};

requestAnimationFrame(function doRender() {
	profile("Render::Frame->Eff(SFML)", () => renderToSfml(drivers.loader, nextFrame.frame));
	requestAnimationFrame(doRender);
});

requestAnimationFrame(function poll() {
	profile("FlushEvents::Sfml->Eff", () => SFML_FlushEvents(event => {
		switch (event.type) {
			case SFML_Events.Closed:
				SFML_Close();
				sub.unsubscribe();
				statDump("MAIN");
				break;
			case SFML_Events.MouseButtonPressed:
				drivers.mouse.mouseDown$.next([event.parameters[0], {
					x: event.parameters[1],
					y: event.parameters[2]
				}]);
				break;
			case SFML_Events.MouseButtonReleased:
				drivers.mouse.mouseUp$.next([event.parameters[0], {
					x: event.parameters[1],
					y: event.parameters[2]
				}]);
				break;
			case SFML_Events.MouseMoved:
				drivers.mouse.mouseMove$.next({
					x: event.parameters[0],
					y: event.parameters[1]
				});
				break;
			case SFML_Events.KeyPressed:
				drivers.keyboard.keyDown$.next(sfmlKeyToKeyCode(event.parameters[0]));
				break;
			case SFML_Events.KeyReleased:
				drivers.keyboard.keyUp$.next(sfmlKeyToKeyCode(event.parameters[0]));
				break;
		}
	}));
	requestAnimationFrame(poll);
});

ENGINE_Reloading = () => { ENGINE_Stash(JSON.stringify(prevState || initialState)); };
ENGINE_Reloaded = (state: string) => { hotreloadedState.next(JSON.parse(state)); };

function sfmlKeyToKeyCode(key: number): Key {
	switch (key) {
		case SFML_Keys.A: return Key.A;
		case SFML_Keys.B: return Key.B;
		case SFML_Keys.C: return Key.C;
		case SFML_Keys.D: return Key.D;
		case SFML_Keys.E: return Key.E;
		case SFML_Keys.F: return Key.F;
		case SFML_Keys.G: return Key.G;
		case SFML_Keys.H: return Key.H;
		case SFML_Keys.I: return Key.I;
		case SFML_Keys.J: return Key.J;
		case SFML_Keys.K: return Key.K;
		case SFML_Keys.L: return Key.L;
		case SFML_Keys.M: return Key.M;
		case SFML_Keys.N: return Key.N;
		case SFML_Keys.O: return Key.O;
		case SFML_Keys.P: return Key.P;
		case SFML_Keys.Q: return Key.Q;
		case SFML_Keys.R: return Key.R;
		case SFML_Keys.S: return Key.S;
		case SFML_Keys.T: return Key.T;
		case SFML_Keys.U: return Key.U;
		case SFML_Keys.V: return Key.V;
		case SFML_Keys.W: return Key.W;
		case SFML_Keys.X: return Key.X;
		case SFML_Keys.Y: return Key.Y;
		case SFML_Keys.Z: return Key.Z;
		case SFML_Keys.Num0: return Key.Zero;
		case SFML_Keys.Num1: return Key.One;
		case SFML_Keys.Num2: return Key.Two;
		case SFML_Keys.Num3: return Key.Three;
		case SFML_Keys.Num4: return Key.Four;
		case SFML_Keys.Num5: return Key.Five;
		case SFML_Keys.Num6: return Key.Six;
		case SFML_Keys.Num7: return Key.Seven;
		case SFML_Keys.Num8: return Key.Eight;
		case SFML_Keys.Num9: return Key.Nine;
		case SFML_Keys.Escape: return Key.Escape;
		case SFML_Keys.LSystem: return Key.LeftWindowKey;
		case SFML_Keys.RSystem: return Key.RightWindowKey;
		case SFML_Keys.LBracket: return Key.OpenBracket;
		case SFML_Keys.RBracket: return Key.ClosedBracket;
		case SFML_Keys.SemiColon: return Key.SemiColon;
		case SFML_Keys.Comma: return Key.Comma;
		case SFML_Keys.Period: return Key.Period;
		case SFML_Keys.Quote: return Key.Quote;
		case SFML_Keys.Slash: return Key.ForwardSlash;
		// case SFML_Keys.BackSlash: return Key.;
		case SFML_Keys.Tilde: return Key.Tilde;
		case SFML_Keys.Equal: return Key.Equals;
		case SFML_Keys.Dash: return Key.Dash;
		case SFML_Keys.Space: return Key.Space;
		case SFML_Keys.Return: return Key.Enter;
		case SFML_Keys.BackSpace: return Key.Backspace;
		case SFML_Keys.Tab: return Key.Tab;
		case SFML_Keys.PageUp: return Key.PageUp;
		case SFML_Keys.PageDown: return Key.PageDown;
		case SFML_Keys.End: return Key.End;
		case SFML_Keys.Home: return Key.Home;
		case SFML_Keys.Insert: return Key.Insert;
		case SFML_Keys.Delete: return Key.Delete;
		case SFML_Keys.Add: return Key.Add;
		case SFML_Keys.Subtract: return Key.Subtract;
		case SFML_Keys.Multiply: return Key.Multiply;
		case SFML_Keys.Divide: return Key.Divide;
		case SFML_Keys.Left: return Key.LeftArrow;
		case SFML_Keys.Right: return Key.RightArrow;
		case SFML_Keys.Up: return Key.UpArrow;
		case SFML_Keys.Down: return Key.DownArrow;
		case SFML_Keys.Numpad0: return Key.Numpad0;
		case SFML_Keys.Numpad1: return Key.Numpad1;
		case SFML_Keys.Numpad2: return Key.Numpad2;
		case SFML_Keys.Numpad3: return Key.Numpad3;
		case SFML_Keys.Numpad4: return Key.Numpad4;
		case SFML_Keys.Numpad5: return Key.Numpad5;
		case SFML_Keys.Numpad6: return Key.Numpad6;
		case SFML_Keys.Numpad7: return Key.Numpad7;
		case SFML_Keys.Numpad8: return Key.Numpad8;
		case SFML_Keys.Numpad9: return Key.Numpad9;
		case SFML_Keys.F1: return Key.F1;
		case SFML_Keys.F2: return Key.F2;
		case SFML_Keys.F3: return Key.F3;
		case SFML_Keys.F4: return Key.F4;
		case SFML_Keys.F5: return Key.F5;
		case SFML_Keys.F6: return Key.F6;
		case SFML_Keys.F7: return Key.F7;
		case SFML_Keys.F8: return Key.F8;
		case SFML_Keys.F9: return Key.F9;
		case SFML_Keys.F10: return Key.F10;
		case SFML_Keys.F11: return Key.F11;
		case SFML_Keys.F12: return Key.F12;
		// case SFML_Keys.F13: return Key.F13;
		// case SFML_Keys.F14: return Key.F14;
		// case SFML_Keys.F15: return Key.F15;
		case SFML_Keys.Pause: return Key.PauseBreak;
		default:
			return 0;
		// case SFML_Keys.Menu: ;
		// case SFML_Keys.LControl: ;
		// case SFML_Keys.LShift: ;
		// case SFML_Keys.LAlt: ;
		// case SFML_Keys.RControl: ;
		// case SFML_Keys.RShift: ;
		// case SFML_Keys.RAlt: ;
	}
}
