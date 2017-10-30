import { Observable } from "rxjs/Observable";
import { IScheduler } from "rxjs/Scheduler";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { async } from "rxjs/scheduler/async";

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

	readonly schedulers?: {
		logical?: IScheduler;
		graphics?: IScheduler;
	};
};

export function getLogicalScheduler(driver: AppDrivers): IScheduler {
	return (driver.schedulers && driver.schedulers.logical) || async;
}

export function getGraphicsScheduler(driver: AppDrivers): IScheduler {
	return (driver.schedulers && driver.schedulers.graphics) || animationFrame;
}
