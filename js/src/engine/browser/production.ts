import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { of } from "rxjs/observable/of";
import { auditTime, distinctUntilChanged, ignoreElements, reduce, retryWhen, scan, switchMap, tap } from "rxjs/operators";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { Subject } from "rxjs/Subject";
import { async } from "rxjs/scheduler/async";

import { bootstrap } from "../../main/game-bootstrap";
import { epic } from "../../main/game-epic";
import { initialState } from "../../main/game-initial-state";
import { postprocess, reducer } from "../../main/game-reducer";
import { render } from "../../main/game-render";
import { GameAction, GameState } from "../../main/game.model";
import { AppDrivers, getLogicalScheduler, PhysicsDrivers, AssetDrivers, InputDrivers, SchedulerDrivers } from "../../pauper/app-drivers";
import { WebAssetLoader } from "../../pauper/assets/web-asset-loader.service";
import { WebAudioService } from "../../pauper/audio/web-audio.service";
import { HtmlDocumentKeyboard } from "../../pauper/input/HtmlDocumentKeyboard";
import { HtmlElementMouse } from "../../pauper/input/HtmlElementMouse";
import { matterJsPhysicsEcsEvents, matterJsPhysicsReducer } from "../../pauper/physics/_inner/matterEngine";
import { renderToCanvas } from "../../pauper/render/render-to-canvas.func";
import { safeBufferTime } from "../../pauper/rx-operators/safeBufferTime";

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
	physics: {
		events: matterJsPhysicsEcsEvents,
		reducer: matterJsPhysicsReducer
	},
	framerates: {
		logicalTick: 10,
		logicalRender: 10
	},
	schedulers: {
		logical: async,
		graphics: animationFrame
	}
};

const r = reducer(drivers as PhysicsDrivers);
const g = {
	render,
	postprocess,
	reducer: r,
	epic: epic(drivers as PhysicsDrivers & AssetDrivers & InputDrivers),
	initialState,
	bootstrap: bootstrap(drivers as AssetDrivers)
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

const logicalTickLimit = drivers.framerates != null && drivers.framerates.logicalTick != null ? drivers.framerates.logicalTick : 10;
const logicalRenderLimit = drivers.framerates != null && drivers.framerates.logicalRender != null ? drivers.framerates.logicalRender : 10;

const fastScan: (reducer: (state: GameState, action: GameAction) => GameState, initialState: GameState) => (input: Observable<GameAction>) => Observable<GameState> =
	(reducer, initialState) => {
		const applyAction = (state: GameState, action: GameAction): GameState => reducer(state, action);
		const applyActions = (state: GameState, actions: ReadonlyArray<GameAction>) => actions.reduce(applyAction, state);

		return self => self.pipe(
			safeBufferTime(logicalTickLimit, getLogicalScheduler(drivers as SchedulerDrivers)),
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

const renderer = render();

const app$ = g.bootstrap.pipe(
	reduce((state: GameState, action: GameAction) => g.reducer(state, action), initialState),
	switchMap(initialState => merge(epicActions$, subject, of({ type: "@@INIT" } as GameAction)).pipe(
		fastScan(applyAction, initialState),
		auditTime(10, animationFrame),
		tap(frame => renderToCanvas({ canvas, context, assets: drivers.loader }, renderer(frame))),
		retryWhen(errs => errs.pipe(tap(err => console.error(err))))
	))
);

app$.subscribe(
	() => { },
	err => { console.error(err); },
	() => { }
);
