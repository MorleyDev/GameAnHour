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
			enabled: true
		}
	}
} as TState & PhysicsState)
