import { Observable } from "rxjs/Observable";

import { AssetLoader } from "../core/assets/asset-loader.service";
import { AudioService } from "../core/audio/audio.service";
import { Keyboard } from "../core/input/Keyboard";
import { Mouse } from "../core/input/Mouse";
import { FrameCollection } from "./render-frame.model";

export type AppDrivers = {
	readonly keyboard?: Keyboard;
	readonly mouse?: Mouse;
	readonly audio?: AudioService;
	readonly loader?: AssetLoader;
	readonly renderer: (frame: Observable<FrameCollection>) => Observable<{}>;

	readonly framerates?: {
		readonly logicalRender?: number;
		readonly logicalTick?: number;
	}
};
