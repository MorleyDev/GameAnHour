import "core-js";

import { empty } from "rxjs/observable/empty";
import { merge } from "rxjs/observable/merge";
import { share } from "rxjs/operators";

import * as game from "./main/game";
import { bootstrap } from "./main/game-bootstrap";
import { initialState } from "./main/game-initial-state";
import { GameAction, GameState } from "./main/game.model";
import { AppDrivers } from "./pauper/app-drivers";
import { NoOpAssetLoader } from "./pauper/assets/noop-asset-loader.service";
import { NoOpAudioService } from "./pauper/audio/noop-audio.service";
import { NoOpKeyboard } from "./pauper/input/NoOpKeyboard";
import { NoOpMouse } from "./pauper/input/NoOpMouse";
import { FrameCollection } from "./pauper/render/render-frame.model";
import { renderToString } from "./pauper/render/render-to-string.func";
import { Subject } from "rxjs/Subject";

declare function GoEngine_SetFrameRenderer(callback: (state: GameState) => FrameCollection): void;
declare function GoEngine_SetReducer(callback: (state: GameState, action: GameAction) => void): void;
declare function GoEngine_SetRenderer(callback: (state: FrameCollection) => void): void;
declare function GoEngine_SetBootstrap(callback: () => void): void;

declare function GoEngine_PushState(state: GameState): void;
declare function GoEngine_PushAction(action: GameAction): void;

const drivers: AppDrivers = {
	keyboard: new NoOpKeyboard(),
	mouse: new NoOpMouse(),
	audio: new NoOpAudioService(),
	loader: new NoOpAssetLoader(),
	renderer: frames => empty()
};
const onAction$ = new Subject<GameAction>();

GoEngine_PushState(initialState);
GoEngine_SetReducer((state: GameState, action: GameAction) => {
	const postProcess = game.postprocess(game.reducer(state, action));

	onAction$.next(action);
	GoEngine_PushState(postProcess.state);
	postProcess.actions.forEach(action => GoEngine_PushAction(action));
});
GoEngine_SetFrameRenderer(game.render);
GoEngine_SetRenderer(state => {
	console.log(renderToString(state));
});
GoEngine_SetBootstrap(() => {
	merge(bootstrap(drivers), game.epic(onAction$, drivers)).subscribe(action => GoEngine_PushAction(action));
});
