import { HashMultiMap } from "../../core/utility/hashmultimap";
import { EntitiesState } from "../../entity-component/entities.state";
import { EntityId } from "../../entity-component/entity-base.type";
import { Entity } from "../../entity-component/entity.type";

export type PhysicsState = EntitiesState & {
	physics: {
		integrationEnabled: boolean;
		activeCollisions: HashMultiMap<EntityId, Entity>;
	};
};

export function PhysicsState<TState extends EntitiesState>(prev: TState): TState & PhysicsState {
	return {
		...(prev as EntitiesState),
		physics: {
			integrationEnabled: true,
			activeCollisions: HashMultiMap<EntityId, Entity>({})
		}
	} as TState & PhysicsState;
}
