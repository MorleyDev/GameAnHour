import { CanvasMouse } from "./pauper/core/input/CanvasMouse";
import "./pauper/core/extensions";

import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { auditTime, reduce, switchMap, tap } from "rxjs/operators";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { Subject } from "rxjs/Subject";

import { bootstrap } from "./main/game-bootstrap";
import { initialState } from "./main/game-initial-state";
import { CanvasRenderer } from "./pauper/core/graphics/canvas-renderer.service";
import { Renderer } from "./pauper/core/graphics/renderer.service";
import { CanvasKeyboard } from "./pauper/core/input/CanvasKeyboard";
import { AppDrivers } from "./pauper/functional/app-drivers";
import { createReduxApp } from "./pauper/functional/ReduxApp.function";
import { ReduxApp } from "./pauper/functional/ReduxApp.type";
import { Render } from "./pauper/functional/render-frame.function";
import { FrameCollection } from "./pauper/functional/render-frame.model";

// import RxFiddle from "rxfiddle";
// (window as any).fiddle = new RxFiddle(require("rxjs/Rx")).auto();

const gameFactory: () => ReduxApp<any, any> = () => require("./main/game");

const game$ = new Subject<ReduxApp<any, any>>();

const canvas = document.getElementById("render-target")! as HTMLCanvasElement;
const canvasRenderer = new CanvasRenderer(canvas);

const debugHooks = { currentState: initialState, actions$: new Subject<any>() };
(window as any).debugHooks = debugHooks;

let latestBootstrap = (module as any).hot
	? merge(bootstrap, debugHooks.actions$)
	: bootstrap;

const devRememberState = (module as any).hot
	? tap((state: any) => {
		debugHooks.currentState = state;
		latestBootstrap = debugHooks.actions$;
	})
	: (state$: Observable<any>): Observable<any> => state$;

const drivers: AppDrivers = {
	keyboard: new CanvasKeyboard(canvas),
	mouse: new CanvasMouse(canvas),
	renderer: frames => frames.pipe(
		auditTime(15, animationFrame),
		reduce((canvas: Renderer, frames: FrameCollection) => Render(canvas, frames), canvasRenderer)
	)
};

const app$ = game$.pipe(
	switchMap(game => createReduxApp(drivers, {
		...game,
		initialState: debugHooks.currentState,
		bootstrap: latestBootstrap
	})),
	devRememberState
);

app$.subscribe();
game$.next(gameFactory());


if ((module as any).hot) {
	(module as any).hot.accept("./main/game", () => {
		game$.next(gameFactory());
	});
}
