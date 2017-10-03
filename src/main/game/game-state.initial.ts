import { Vector2 } from "../../core/maths/vector.maths";
import { Key } from "../../core/models/keys.model";
import { Point2 } from "../../core/models/point/point.model";
import { Rectangle } from "../../core/models/rectangle/rectangle.model";
import { EntitiesState } from "../../entity-component/entities.state";
import { Entity } from "../../entity-component/entity.type";
import { Fill } from "../../functional/render-frame.model";
import { SystemState } from "../../functional/system.state";
import { PhysicsCollidableComponent } from "../physics/physics-collidable.component";
import { extractCollisionMap } from "../physics/physics-extract.func";
import { PhysicsObjectComponent } from "../physics/physics-object.component";
import { GameState } from "./game-state.type";

export const initialState: GameState = { }
	.pipe(EntitiesState, [
		Entity(
			PhysicsObjectComponent(Point2(0, 0), Vector2(20, 10)),
			PhysicsCollidableComponent([ Rectangle(-10, -5, 20, 10) ]),
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
