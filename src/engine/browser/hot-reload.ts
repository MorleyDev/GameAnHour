import { applyMiddleware, compose, createStore } from "redux";
import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { merge } from "rxjs/observable/merge";
import { of } from "rxjs/observable/of";
import { auditTime, distinctUntilChanged, ignoreElements, reduce, scan, switchMap, tap } from "rxjs/operators";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { Subject } from "rxjs/Subject";

import { bootstrap } from "../../main/game-bootstrap";
import { initialState } from "../../main/game-initial-state";
import { GameAction, GameState } from "../../main/game.model";
import { AppDrivers, getLogicalScheduler } from "../../pauper/app-drivers";
import { WebAssetLoader } from "../../pauper/assets/web-asset-loader.service";
import { WebAudioService } from "../../pauper/audio/web-audio.service";
import { HtmlDocumentKeyboard } from "../../pauper/input/HtmlDocumentKeyboard";
import { HtmlElementMouse } from "../../pauper/input/HtmlElementMouse";
import { matterJsPhysicsEcsEvents, matterJsPhysicsReducer } from "../../pauper/physics/_inner/matterEngine";
import { profile } from "../../pauper/profiler";
import { FrameCollection } from "../../pauper/render/render-frame.model";
import { renderToCanvas } from "../../pauper/render/render-to-canvas.func";
import { safeBufferTime } from "../../pauper/rx-operators/safeBufferTime";

// import RxFiddle from "rxfiddle";
// (window as any).fiddle = new RxFiddle(require("rxjs/Rx")).auto();

type GameDefinition = {
	render: (state: GameState) => FrameCollection;
	reducer: (drivers: AppDrivers) => (state: GameState, action: GameAction) => GameState;
	postprocess: (state: GameState) => { readonly state: GameState; readonly actions: ReadonlyArray<GameAction> };
	epic: (drivers: AppDrivers) => (action$: Observable<GameAction>) => Observable<GameAction>;
};

const gameFactory: () => GameDefinition = () => ({
	...require("../../main/game-render"),
	...require("../../main/game-reducer"),
	...require("../../main/game-epic"),
});

const game$ = new Subject<GameDefinition>();

const canvas = document.getElementById("render-target")! as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

const element = document.getElementById("canvas-container")!;
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
	}
};

const debugHooks = { currenGameState: initialState, actions$: new Subject<any>() };
(window as any).debugHooks = debugHooks;

let latestBootstrap = bootstrap;

const devRememberState = (module as any).hot
	? tap((state: any) => {
		debugHooks.currenGameState = state;
		latestBootstrap = empty();
	})
	: (state$: Observable<any>): Observable<any> => state$;

const devCompose = typeof window !== "undefined" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
const c = devCompose || compose;

const logicalTickLimit = drivers.framerates != null && drivers.framerates.logicalTick != null ? drivers.framerates.logicalTick : 10;
const logicalRenderLimit = drivers.framerates != null && drivers.framerates.logicalRender != null ? drivers.framerates.logicalRender : 10;

const storeBackedScan: (reducer: (state: GameState, action: GameAction) => GameState, initialState: GameState) => (input: Observable<GameAction>) => Observable<GameState> =
	(reducer, initialState) => {
		const applyAction = (state: GameState, action: GameAction): GameState => profile(action.type, () => { store.dispatch(action as any); return store; }).getState();
		const applyActions = (state: GameState, actions: ReadonlyArray<GameAction>) => actions.reduce(applyAction, state);

		const store = createStore(reducer as any, initialState, c(applyMiddleware()));
		return self => self.pipe(
			safeBufferTime(logicalTickLimit, getLogicalScheduler(drivers as AppDrivers)),
			scan(applyActions, initialState),
			distinctUntilChanged()
		);
	};

const postProcessSubject = new Subject<GameAction>();
const subject = new Subject<GameAction>();
const epicActions$ = (game: GameDefinition): Observable<GameAction> => game.epic(drivers as AppDrivers)(merge(subject, postProcessSubject)).pipe(
	tap((action: GameAction) => subject.next(action)),
	ignoreElements()
);

const applyAction = (game: GameDefinition) => {
	const r = game.reducer(drivers as AppDrivers);
	return (state: GameState, action: GameAction): GameState => {
		const nexGameState = r(state, action);
		const { state: newState, actions: followup } = game.postprocess(nexGameState);
		return followup
			.map((action: GameAction) => {
				postProcessSubject.next(action);
				return action;
			})
			.reduce(applyAction(game), newState);
	};
};

const app$ = game$.pipe(
	switchMap(game => {
		const r = game.reducer(drivers as AppDrivers);
		return latestBootstrap.pipe(
			reduce((state: GameState, action: GameAction) => r(state, action), initialState),
			switchMap(state =>
				merge(epicActions$(game), subject, of({ type: "@@INIT" } as GameAction)).pipe(
					storeBackedScan(applyAction(game), state)
				)
			),
			auditTime(10, animationFrame),
			tap(frame => renderToCanvas({ canvas, context }, game.render(frame))),
		);
	}),
	devRememberState
);

app$.subscribe(
	() => { },
	err => { console.error(err); },
	() => { }
);
game$.next(gameFactory());


(module as any).hot.accept("../../main/game-reducer", () => game$.next(gameFactory()));
(module as any).hot.accept("../../main/game-epic", () => game$.next(gameFactory()));
(module as any).hot.accept("../../main/game-render", () => game$.next(gameFactory()));
