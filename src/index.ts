import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { merge } from "rxjs/observable/merge";
import { auditTime, reduce, retryWhen, switchMap, tap, map } from "rxjs/operators";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { Subject } from "rxjs/Subject";

import { bootstrap } from "./main/game-bootstrap";
import { initialState } from "./main/game-initial-state";
import { WebAssetLoader } from "./pauper/assets/web-asset-loader.service";
import { WebAudioService } from "./pauper/audio/web-audio.service";
import { HtmlDocumentKeyboard } from "./pauper/input/HtmlDocumentKeyboard";
import { HtmlElementMouse } from "./pauper/input/HtmlElementMouse";
import { AppDrivers } from "./pauper/app-drivers";
import { createReduxApp } from "./pauper/redux/ReduxApp.func";
import { ReduxApp } from "./pauper/redux/ReduxApp.type";
import { FrameCollection } from "./pauper/render/render-frame.model";
import { renderToCanvas } from "./pauper/render/render-to-canvas.func";

// import RxFiddle from "rxfiddle";
// (window as any).fiddle = new RxFiddle(require("rxjs/Rx")).auto();

const gameFactory: () => ReduxApp<any, any> = () => require("./main/game");

const game$ = new Subject<ReduxApp<any, any>>();

const canvas = document.getElementById("render-target")! as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

const element = document.getElementById("canvas-container")!;
const drivers: AppDrivers = {
	keyboard: new HtmlDocumentKeyboard(document),
	mouse: new HtmlElementMouse(canvas),
	audio: new WebAudioService(),
	loader: new WebAssetLoader(),
	renderer: frames => frames.pipe(
		auditTime(15, animationFrame),
		reduce((
			{ canvas, context }: { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D }, frames: FrameCollection) => renderToCanvas({ canvas, context }, frames),
			{ canvas, context }
		)
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
	map(game => ({
		...game,
		epic: actions$ => merge(game.epic(actions$, drivers), debugHooks.actions$),
		initialState: debugHooks.currentState,
		bootstrap: latestBootstrap
	} as ReduxApp<any, any>)),

	switchMap(game =>
		createReduxApp(drivers, game).pipe(
			retryWhen(errs => errs.pipe(tap(err => console.error(err))))
		)
	),
	devRememberState
);

app$.subscribe();
game$.next(gameFactory());


if ((module as any).hot) {
	(module as any).hot.accept("./main/game", () => {
		game$.next(gameFactory());
	});
}
