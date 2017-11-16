import { GenericAction } from "./redux/generic.action";
import { IScheduler } from "rxjs/Scheduler";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { async } from "rxjs/scheduler/async";

import { AssetLoader } from "./assets/asset-loader.service";
import { AudioService } from "./audio/audio.service";
import { EntitiesState } from "./ecs/entities.state";
import { EntityComponentReducerEvents } from "./ecs/entity-component.reducer";
import { Keyboard } from "./input/Keyboard";
import { Mouse } from "./input/Mouse";
import { PhysicsUpdateResult } from "./physics/update.model";
import { SpecificReducer } from "./redux/reducer.type";
import { Observable } from "rxjs/Observable";

export type PhysicsDrivers = {
	readonly physics: {
		events: EntityComponentReducerEvents;
		reducer: <TState extends EntitiesState, TAction extends GenericAction>(onUpdate: (state: TState, result: PhysicsUpdateResult) => TState) => SpecificReducer<TState, TAction>;
	};
};

export type AssetDrivers = {
	readonly audio: AudioService;
	readonly loader: AssetLoader;
};

export type InputDrivers = {
	readonly keyboard: Keyboard;
	readonly mouse: Mouse;
};

export type FrameRateDrivers = {
	readonly framerates: {
		readonly logicalRender: number;
		readonly logicalTick: number;
	};

};

export type SchedulerDrivers = {
	readonly schedulers: {
		logical: IScheduler;
		graphics: IScheduler;
	};
};

export type SystemDrivers = {
	readonly system: {
		readonly focus: Observable<boolean>;
	};
};

export type AppDrivers = PhysicsDrivers & AssetDrivers & InputDrivers & FrameRateDrivers & SchedulerDrivers;

export function getLogicalScheduler(driver: SchedulerDrivers): IScheduler {
	return (driver.schedulers && driver.schedulers.logical) || async;
}

export function getGraphicsScheduler(driver: SchedulerDrivers): IScheduler {
	return (driver.schedulers && driver.schedulers.graphics) || animationFrame;
}