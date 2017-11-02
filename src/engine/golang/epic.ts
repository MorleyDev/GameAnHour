import "core-js";

import { merge } from "rxjs/observable/merge";
import { Subject } from "rxjs/Subject";

import { epic } from "../../main/game";
import { GameAction } from "../../main/game.model";
import { NoOpAssetLoader } from "../../pauper/assets/noop-asset-loader.service";
import { NoOpAudioService } from "../../pauper/audio/noop-audio.service";
import { NoOpKeyboard } from "../../pauper/input/NoOpKeyboard";
import { SubjectMouse } from "../../pauper/input/SubjectMouse";
import { MouseButton } from "../../pauper/models/mouse-button.model";
import { Point2 } from "../../pauper/models/shapes.model";

const drivers = {
	keyboard: new NoOpKeyboard(),
	mouse: new SubjectMouse(),
	audio: new NoOpAudioService(),
	loader: new NoOpAssetLoader()
};

declare function GoEngine_OnAction(callback: (action: GameAction) => void): void;
declare function GoEngine_PushAction(action: GameAction): void;

declare function GoEngine_OnMouseUp(callback: (x: number, y: number, button: number) => void): void;
declare function GoEngine_OnMouseDown(callback: (x: number, y: number, button: number) => void): void;

GoEngine_OnMouseUp((x, y, button) => {
	drivers.mouse!.mouseUp$.next([button as MouseButton, Point2(x, y)]);
});
GoEngine_OnMouseDown((x, y, button) => {
	drivers.mouse!.mouseDown$.next([button as MouseButton, Point2(x, y)]);
});

const onEpicAction$ = new Subject<GameAction>();
const onEngineAction$ = new Subject<GameAction>();

epic(merge(onEngineAction$, onEpicAction$), drivers).subscribe(action => {
	onEpicAction$.next(action);
	GoEngine_PushAction(action);
});

GoEngine_OnAction(action => onEngineAction$.next(action));
