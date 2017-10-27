import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { merge } from "rxjs/observable/merge";
import { auditTime, catchError, reduce, switchMap, tap } from "rxjs/operators";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { Subject } from "rxjs/Subject";

import { bootstrap } from "./main/game-bootstrap";
import { initialState } from "./main/game-initial-state";
import { WebAssetLoader } from "./pauper/core/assets/web-asset-loader.service";
import { WebAudioService } from "./pauper/core/audio/web-audio.service";
import { CanvasRenderer } from "./pauper/core/graphics/canvas-renderer.service";
import { Renderer } from "./pauper/core/graphics/renderer.service";
import { HtmlDocumentKeyboard } from "./pauper/core/input/HtmlDocumentKeyboard";
import { HtmlElementMouse } from "./pauper/core/input/HtmlElementMouse";
import { AppDrivers } from "./pauper/functional/app-drivers";
import { createReduxApp } from "./pauper/functional/ReduxApp.function";
import { ReduxApp } from "./pauper/functional/ReduxApp.type";
import { FrameCollection } from "./pauper/functional/render-frame.model";
import { RenderToRenderer } from "./pauper/functional/render-to-renderer.function";

// import RxFiddle from "rxfiddle";
// (window as any).fiddle = new RxFiddle(require("rxjs/Rx")).auto();

const gameFactory: () => ReduxApp<any, any> = () => require("./main/game");

const game$ = new Subject<ReduxApp<any, any>>();

const canvas = document.getElementById("render-target")! as HTMLCanvasElement;
const canvasRenderer = new CanvasRenderer(canvas);
const element = document.getElementById("canvas-container")!;
const drivers: AppDrivers = {
	keyboard: new HtmlDocumentKeyboard(document),
	mouse: new HtmlElementMouse(canvas),
	audio: new WebAudioService(),
	loader: new WebAssetLoader(),
	renderer: frames => frames.pipe(
		auditTime(15, animationFrame),
		reduce((canvas: Renderer, frames: FrameCollection) => RenderToRenderer(canvas, frames), canvasRenderer)
	)
};

const debugHooks = { currentState: initialState, actions$: new Subject<any>() };
(window as any).debugHooks = debugHooks;

let latestBootstrap = bootstrap(drivers);

const devRememberState = (module as any).hot
	? tap((state: any) => {
		debugHooks.currentState = state;
		latestBootstrap = empty();
	})
	: (state$: Observable<any>): Observable<any> => state$;


const app$ = game$.pipe(
	switchMap(game => createReduxApp(drivers, {
		...game,
		epic: actions$ => merge(game.epic(actions$, drivers), debugHooks.actions$),
		initialState: debugHooks.currentState,
		bootstrap: latestBootstrap
	})),
	devRememberState,
	catchError(err => {
		console.error(err);
		return empty();
	})
);

app$.subscribe();
game$.next(gameFactory());


if ((module as any).hot) {
	(module as any).hot.accept("./main/game", () => {
		game$.next(gameFactory());
	});
}
