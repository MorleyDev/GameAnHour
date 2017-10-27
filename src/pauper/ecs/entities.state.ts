import { List, Map } from "immutable";

import { BaseEntity, EntityId } from "./entity-base.type";

export type EntitiesState = {
	readonly entities: Map<EntityId, BaseEntity>;
	readonly componentEntityLinks: Map<string, List<EntityId>>;
};

export const EntitiesState = <TState>(state: TState): TState & EntitiesState => ({
	...(state as any),
	entities: Map<EntityId, BaseEntity>(),
	componentEntityLinks: Map<string, List<EntityId>>()
});
