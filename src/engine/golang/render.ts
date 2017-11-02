import "core-js";

import { render } from "../../main/game";
import { GameState } from "../../main/game.model";
import { FrameCollection } from "../../pauper/render/render-frame.model";

declare function GoEngine_SetFrameRender(callback: (state: GameState) => FrameCollection): void;

GoEngine_SetFrameRender(render);
