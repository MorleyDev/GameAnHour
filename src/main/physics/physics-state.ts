import { Vector2 } from "../../core/maths/vector.maths";
import { HashMultiMap } from "../../core/utility/hashmultimap";
import { EntitiesState } from "../../entity-component/entities.state";
import { EntityId } from "../../entity-component/entity-base.type";

export type PhysicsState = EntitiesState & {
	physics: {
		collisions: {
			enabled: boolean;
			active: HashMultiMap<EntityId, EntityId>;
		};
		integrator: {
			enabled: boolean;
			gravity: Vector2;
			scale: number;
		}
	};
};
export const PhysicsState = <TState extends EntitiesState>(state: TState): TState & PhysicsState => ({
	...(state as EntitiesState),
	physics: {
		collisions: {
			enabled: true,
			active: HashMultiMap<EntityId, EntityId>()
		},
		integrator: {
			enabled: true,
			gravity: Vector2(0, 0),
			scale: 100
		}
	}
} as TState & PhysicsState);
