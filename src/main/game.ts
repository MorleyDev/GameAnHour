import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Point2 } from "../core/models/point/point.model";
import { Seconds } from "../core/models/time.model";
import { EntitiesState } from "../entity-component/entities.state";
import { entityComponentEpic } from "../entity-component/entity-component.epic";
import { entityComponentReducer } from "../entity-component/entity-component.reducer";
import { entityComponentRender } from "../entity-component/entity-component.render";
import { entityComponentTick } from "../entity-component/entity-component.tick";
import { GenericAction } from "../functional/generic.action";
import { FrameCollection, Origin } from "../functional/render-frame.model";
import { Clear, Frame } from "../functional/render-frame.model";
import { SystemState } from "../functional/system.state";

type GameTick = (tick$: Observable<{ deltaTime: Seconds, state: GameState }>) => Observable<GenericAction>;
export const gameTick: GameTick = tick$ => merge(
	entityComponentTick(tick$)
);

type GameState = SystemState & EntitiesState;
export const initialState: GameState = {}
	.pipe(SystemState)
	.pipe(EntitiesState, []);

type GameRender = (state: GameState) => FrameCollection;
export const gameRender: GameRender = state => Frame(
	Clear,
	Origin(Point2(320, 240), [
		...entityComponentRender(state)
	])
);

type GameReducer = (state: GameState, curr: GenericAction) => GameState;
export const gameReducer: GameReducer = (state, action) => state
	.pipe(entityComponentReducer, action);

type GameEpic = (action$: Observable<GenericAction>, state: () => GameState) => Observable<GenericAction>;
export const gameEpic: GameEpic = (action$, state) => merge(
	entityComponentEpic(action$, state)
);
