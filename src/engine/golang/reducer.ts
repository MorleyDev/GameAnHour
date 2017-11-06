import "babel-polyfill";

import { postprocess, reducer } from "../../main/game-reducer";
import { GameAction, GameState } from "../../main/game.model";
import { AppDrivers } from "../../pauper/app-drivers";
import { NoOpAssetLoader } from "../../pauper/assets/noop-asset-loader.service";
import { NoOpAudioService } from "../../pauper/audio/noop-audio.service";
import { NoOpKeyboard } from "../../pauper/input/NoOpKeyboard";
import { SubjectMouse } from "../../pauper/input/SubjectMouse";
import { matterJsPhysicsEcsEvents, matterJsPhysicsReducer } from "../../pauper/physics/_inner/matterEngine";

declare function GoEngine_SetReducer(callback: (state: GameState, action: GameAction) => GameState): void;
declare function GoEngine_PushAction(action: GameAction): void;

const drivers = {
	keyboard: new NoOpKeyboard(),
	mouse: new SubjectMouse(),
	audio: new NoOpAudioService(),
	loader: new NoOpAssetLoader(),
	framerates: {
		logicalRender: 20,
		logicalTick: 20
	},
	physics: {
		events: matterJsPhysicsEcsEvents,
		reducer: matterJsPhysicsReducer
	}
};

const r = reducer(drivers as AppDrivers);

GoEngine_SetReducer((state: GameState, action: GameAction) => {
	const postProcess = postprocess(r(state, action));

	postProcess.actions.forEach(GoEngine_PushAction);
	return postProcess.state;
});
