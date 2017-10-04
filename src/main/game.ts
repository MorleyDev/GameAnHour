import { GenericAction } from "../functional/generic.action";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Seconds } from "../core/models/time.model";
import { EntitiesState } from "../entity-component/entities.state";
import { EntityComponentAction } from "../entity-component/entity-component.actions";
import { entityComponentEpic } from "../entity-component/entity-component.epic";
import { entityComponentReducer } from "../entity-component/entity-component.reducer";
import { entityComponentRender } from "../entity-component/entity-component.render";
import { entityComponentTick } from "../entity-component/entity-component.tick";
import { FrameCollection } from "../functional/render-frame.model";
import { Clear, Frame } from "../functional/render-frame.model";
import { SystemAction } from "../functional/system.action";
import { SystemState } from "../functional/system.state";
import { PhysicsAction } from "./physics/physics.actions";
import { physicsReducer } from "./physics/physics.reducer";
import { PhysicsState } from "./physics/physics.state";
import { physicsTick } from "./physics/physics.tick";

type GameTick = (tick$: Observable<{ deltaTime: Seconds, state: GameState }>) => Observable<GenericAction>;
export const gameTick: GameTick = tick$ => merge(
	physicsTick(tick$),
	entityComponentTick(tick$)
);

type GameState = PhysicsState & SystemState;
export const initialState: GameState = {}
	.pipe(SystemState)
	.pipe(EntitiesState, [
	])
	.pipe(PhysicsState);

type GameRender = (state: GameState) => FrameCollection;
export const gameRender: GameRender = state => Frame(
	Clear,
	entityComponentRender(state)
);

type GameReducer = (state: GameState, curr: GenericAction) => GameState;
export const gameReducer: GameReducer = (state, action) => state
	.pipe(entityComponentReducer, action)
	.pipe(physicsReducer, action)
	.pipe((state, action) => state, action);

type GameEpic = (action$: Observable<GenericAction>, state: () => GameState) => Observable<GenericAction>;
export const gameEpic: GameEpic = (action$, state) => merge(
	entityComponentEpic(action$, state)
);
