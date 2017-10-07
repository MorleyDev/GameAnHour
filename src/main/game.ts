import "../core/extensions";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Seconds } from "../core/models/time.model";
import { EntitiesState } from "../entity-component/entities.state";
import { GenericAction } from "../functional/generic.action";
import { BaseReduxApp } from "../functional/ReduxApp.type";
import { Clear, FrameCollection, Origin } from "../functional/render-frame.model";
import { SystemState } from "../functional/system.state";

type GameState = EntitiesState & SystemState;

export class Game extends BaseReduxApp<GameState, GenericAction> {
	constructor() {
		super(SystemState, EntitiesState([
		]));
	}

	public reducer(state: GameState, action: GenericAction): GameState {
		return state;
	}

	public update(tick: Observable<{ state: GameState, deltaTime: Seconds }>): Observable<GenericAction> {
		return merge();
	}

	public render(state: GameState): FrameCollection {
		return [
			Clear,
			Origin({ x: 320, y: 240 }, [])
		];
	}

	public epic(action$: Observable<GenericAction>, state: () => GameState): Observable<GenericAction> {
		return merge();
	}
}
