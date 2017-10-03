import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Vector2 } from "../core/maths/vector.maths";
import { Key } from "../core/models/keys.model";
import { Point2 } from "../core/models/point/point.model";
import { Rectangle } from "../core/models/rectangle/rectangle.model";
import { Seconds } from "../core/models/time.model";
import { EntitiesState } from "../entity-component/entities.state";
import { EntityComponentAction } from "../entity-component/entity-component.actions";
import { entityComponentEpic } from "../entity-component/entity-component.epic";
import { entityComponentReducer } from "../entity-component/entity-component.reducer";
import { entityComponentRender } from "../entity-component/entity-component.render";
import { entityComponentTick } from "../entity-component/entity-component.tick";
import { Entity } from "../entity-component/entity.type";
import { Fill } from "../functional/render-frame.model";
import { Clear, Frame } from "../functional/render-frame.model";
import { FrameCollection } from "../functional/render-frame.model";
import { SystemAction } from "../functional/system.action";
import { SystemState } from "../functional/system.state";
import { PhysicsCollidableComponent } from "./physics/physics-collidable.component";
import { extractCollisionMap } from "./physics/physics-extract.func";
import { PhysicsObjectComponent } from "./physics/physics-object.component";
import { PhysicsAction } from "./physics/physics.actions";
import { physicsReducer } from "./physics/physics.reducer";
import { physicsTick } from "./physics/physics.tick";

export type GameAction = SystemAction | EntityComponentAction | PhysicsAction;

export type GameTick = (tick$: Observable<{ deltaTime: Seconds, state: GameState }>) => Observable<GameAction>;

export const gameTick: GameTick = tick$ => merge(
	physicsTick(tick$) as Observable<GameAction>,
	entityComponentTick(tick$) as Observable<GameAction>
);

export type GameState = EntitiesState & SystemState;
export const initialState: GameState = {}
	.pipe(EntitiesState, [
		Entity(
			PhysicsObjectComponent(Point2(0, 0), Vector2(20, 10)),
			PhysicsCollidableComponent([Rectangle(-10, -5, 20, 10)]),
			{
				name: "BOUNCING_AROUND_WORLD",
				reduce(entity, action) {
					if (action.type === "EVENTS_KEY_DOWN" && action.key === Key.Space) {
						return {
							...entity,
							components: entity.components.map((c: PhysicsObjectComponent) => c.name === "PHYSICS_OBJECT" ? ({
								...c,
								data: {
									...c.data,
									velocity: Vector2.invert(c.data.velocity)
								}
							} as PhysicsObjectComponent) : c)
						};
					}
					return entity;
				}
			},
			{
				name: "RENDER_COLLISION_MESH",
				render(self) {
					return extractCollisionMap(self.components).map(shape => Fill(shape, "blue"));
				}
			}
		)
	])
	.pipe(SystemState);

export type GameRender = (state: GameState) => FrameCollection;
export const gameRender: GameRender = state => Frame(
	Clear,
	entityComponentRender(state)
);

export type GameReducer = (state: GameState, curr: GameAction) => GameState;
export const gameReducer: GameReducer = (state, action) => state
	.pipe(entityComponentReducer, action)
	.pipe(physicsReducer, action);

export type GameEpic = (action$: Observable<GameAction>, state: () => GameState) => Observable<GameAction>;
export const gameEpic: GameEpic = (action$, state) => merge(
	entityComponentEpic(action$, state) as Observable<GameAction>
);
