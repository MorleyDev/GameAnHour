import { Observable } from "rxjs/Observable";

import { AssetLoader } from "./assets/asset-loader.service";
import { AudioService } from "./audio/audio.service";
import { Keyboard } from "./input/Keyboard";
import { Mouse } from "./input/Mouse";
import { FrameCollection } from "./render/render-frame.model";

export type AppDrivers = {
	readonly keyboard?: Keyboard;
	readonly mouse?: Mouse;
	readonly audio?: AudioService;
	readonly loader?: AssetLoader;
	readonly renderer: (frame: Observable<FrameCollection>) => Observable<{}>;

	readonly framerates?: {
		readonly logicalRender?: number;
		readonly logicalTick?: number;
	};
};
