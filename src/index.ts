import "./pauper/core/extensions";

import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { merge } from "rxjs/observable/merge";
import { auditTime, map, reduce, share, switchMap, tap, throttleTime } from "rxjs/operators";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { Subject } from "rxjs/Subject";

import { bootstrap } from "./main/game-bootstrap";
import { initialState } from "./main/game-initial-state";
import { CanvasRenderer } from "./pauper/core/graphics/canvas-renderer.service";
import { Renderer } from "./pauper/core/graphics/renderer.service";
import { profile } from "./pauper/core/profiler";
import { createReduxApp } from "./pauper/functional/ReduxApp.function";
import { ReduxApp } from "./pauper/functional/ReduxApp.type";
import { Render } from "./pauper/functional/render-frame.function";
import { FrameCollection } from "./pauper/functional/render-frame.model";

// import RxFiddle from "rxfiddle";
// (window as any).fiddle = new RxFiddle(require("rxjs/Rx")).auto();

const gameFactory: () => ReduxApp<any, any> = () => require("./main/game");

const game$ = new Subject<ReduxApp<any, any>>();
const canvas = new CanvasRenderer(document.getElementById("render-target")!);

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

const app$ = game$.pipe(
	switchMap(game => createReduxApp({ ...game, initialState: debugHooks.currentState, bootstrap: latestBootstrap }).pipe(
		devRememberState,
		map(state => profile("@@RENDER", () => game.render(state)))
	)),
	auditTime(16, animationFrame),
	reduce((canvas: Renderer, frames: FrameCollection) => Render(canvas, frames), canvas)
);

app$.subscribe();
game$.next(gameFactory());


if ((module as any).hot) {
	(module as any).hot.accept("./main/game", () => {
		game$.next(gameFactory());
	});
}
