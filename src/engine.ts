import { retryWhen, tap } from "rxjs/operators";
import "core-js";

import { merge } from "rxjs/observable/merge";
import { Subject } from "rxjs/Subject";

import * as game from "./main/game";
import { bootstrap } from "./main/game-bootstrap";
import { initialState } from "./main/game-initial-state";
import { GameAction, GameState } from "./main/game.model";
import { NoOpAssetLoader } from "./pauper/assets/noop-asset-loader.service";
import { NoOpAudioService } from "./pauper/audio/noop-audio.service";
import { NoOpKeyboard } from "./pauper/input/NoOpKeyboard";
import { SubjectMouse } from "./pauper/input/SubjectMouse";
import { MouseButton } from "./pauper/models/mouse-button.model";
import { Point2 } from "./pauper/models/shapes.model";
import { FrameCollection } from "./pauper/render/render-frame.model";

declare function GoEngine_SetFrameRenderer(callback: (state: GameState) => FrameCollection): void;
declare function GoEngine_SetReducer(callback: (state: GameState, action: GameAction) => GameState): void;
declare function GoEngine_SetRenderer(callback: (state: FrameCollection) => void): void;
declare function GoEngine_SetBootstrap(callback: () => void): void;

declare function GoEngine_PushState(state: GameState): void;
declare function GoEngine_PushAction(action: GameAction): void;

declare function GoEngine_OnMouseUp(callback: (x: number, y: number, button: number) => void): void;
declare function GoEngine_OnMouseDown(callback: (x: number, y: number, button: number) => void): void;

const drivers = {
	keyboard: new NoOpKeyboard(),
	mouse: new SubjectMouse(),
	audio: new NoOpAudioService(),
	loader: new NoOpAssetLoader()
};
const onAction$ = new Subject<GameAction>();

GoEngine_PushState(initialState);
GoEngine_SetReducer((state: GameState, action: GameAction) => {
	const postProcess = game.postprocess(game.reducer(state, action));

	onAction$.next(action);
	postProcess.actions.forEach(action => GoEngine_PushAction(action));
	return postProcess.state;
});
GoEngine_SetFrameRenderer(game.render);

GoEngine_OnMouseUp((x, y, button) => {
	drivers.mouse!.mouseUp$.next([button as MouseButton, Point2(x, y)]);
});
GoEngine_OnMouseDown((x, y, button) => {
	drivers.mouse!.mouseDown$.next([button as MouseButton, Point2(x, y)]);
});

GoEngine_SetBootstrap(() => {
	merge(bootstrap(drivers), game.epic(onAction$, drivers))
		.pipe(retryWhen(err => err.pipe(tap(err => console.error(err)))))
		.subscribe(
		action => GoEngine_PushAction(action),
		() => { }
		);
});
