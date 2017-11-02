import { Observable } from "rxjs/Observable";
import { auditTime, retryWhen, tap } from "rxjs/operators";
import { animationFrame } from "rxjs/scheduler/animationFrame";

import * as game from "../../main/game";
import { bootstrap } from "../../main/game-bootstrap";
import { initialState } from "../../main/game-initial-state";
import { GameAction, GameState } from "../../main/game.model";
import { AppDrivers } from "../../pauper/app-drivers";
import { WebAssetLoader } from "../../pauper/assets/web-asset-loader.service";
import { WebAudioService } from "../../pauper/audio/web-audio.service";
import { HtmlDocumentKeyboard } from "../../pauper/input/HtmlDocumentKeyboard";
import { HtmlElementMouse } from "../../pauper/input/HtmlElementMouse";
import { createReduxApp } from "../../pauper/redux/ReduxApp.func";
import { renderToCanvas } from "../../pauper/render/render-to-canvas.func";

// import RxFiddle from "rxfiddle";
// (window as any).fiddle = new RxFiddle(require("rxjs/Rx")).auto();

const canvas = document.getElementById("render-target")! as HTMLCanvasElement;
const context = canvas.getContext("2d")!;
const element = document.getElementById("canvas-container")!;
const drivers: AppDrivers = {
	keyboard: new HtmlDocumentKeyboard(document),
	mouse: new HtmlElementMouse(canvas),
	audio: new WebAudioService(),
	loader: new WebAssetLoader()
};

const g = {
	render: (state: GameState) => game.render(state),
	postprocess: (prev: GameState) => game.postprocess(prev),
	reducer: (prev: GameState, curr: GameAction) => game.reducer(prev, curr),
	epic: (actions$: Observable<GameAction>) => game.epic(actions$, drivers),
	initialState,
	bootstrap: bootstrap
};

const app$ = createReduxApp(drivers, g).pipe(
	auditTime(10, animationFrame),
	tap(frame => renderToCanvas({ canvas, context }, game.render(frame))),
	retryWhen(errs => errs.pipe(tap(err => console.error(err))))
);

app$.subscribe();
