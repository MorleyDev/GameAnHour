import { Map } from "immutable";

import { fmerge } from "../core/extensions/Array.merge.func";
import { HashMap } from "../core/utility/hashmap";
import { HashMultiMap } from "../core/utility/hashmultimap";
import { BaseComponent } from "./component-base.type";
import { BaseEntity, EntityId } from "./entity-base.type";
import { Entity } from "./entity.type";

export type EntitiesState = {
	readonly entities: HashMap<EntityId, BaseEntity>;
	readonly componentEntityLinks: HashMultiMap<string, EntityId>;
};

export const EntitiesState = <TState>(state: TState): TState & EntitiesState => ({
	...(state as any),
	entities: HashMap<EntityId, BaseEntity>(),
	componentEntityLinks: HashMultiMap<string, EntityId>()
});
