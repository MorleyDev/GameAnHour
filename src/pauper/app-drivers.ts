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

export type AppDrivers = {
	readonly keyboard?: Keyboard;
	readonly mouse?: Mouse;
	readonly audio?: AudioService;
	readonly loader?: AssetLoader;

	readonly physics: {
		events: EntityComponentReducerEvents;
		reducer: <TState extends EntitiesState, TAction extends GenericAction>(onUpdate: (state: TState, result: PhysicsUpdateResult) => TState) => SpecificReducer<TState, TAction>;
	};

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
