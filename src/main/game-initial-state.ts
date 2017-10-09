import { PhysicsCollidableComponent } from "./physics/physics-collidable.component";
import { Vector2 } from "../core/maths/vector.maths";
import { Circle, Point2 } from "../core/models/shapes.model";
import { PhysicsPhysicalComponent } from "./physics/physics-physical.component";
import { EntitiesState } from "../entity-component/entities.state";
import { SystemState } from "../functional/system.state";
import { GameEntity, GameState } from "./game-models";
import { PhysicsState } from "./physics/physics-state";

const initialEntities: GameEntity[] = Array(6).fill(0).mergeMap((_, j) => Array(6).fill(0).map((_, i) => [i, j]))
	.map(([i,j]) => GameEntity(
		"Ball",
		({ name: "RENDER_Colour", colour: `rgb(${255 - (i * (255 / 3))}, ${255 - (j * (255 / 3))}, 255)` } as any),
		PhysicsPhysicalComponent(Point2(i * 30 + 15 - 160, j * 30 + 15 - 120), Vector2(0, 0), 1),
		PhysicsCollidableComponent(Circle(0, 0, 10))
	));

export const initialState: GameState = {}
	.pipe(SystemState)
	.pipe(EntitiesState(initialEntities))
	.pipe(PhysicsState);
