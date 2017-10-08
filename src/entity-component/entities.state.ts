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

export const EntitiesState = <TState, TComponent extends BaseComponent>(entities: Entity<TComponent>[]): (state: TState) => TState & EntitiesState => state => ({
	...(state as any),
	entities: HashMap.fromMap(Map(entities.map(entity => [entity.id, entity] as [string, BaseEntity]))),
	componentEntityLinks: extractEntityComponentLinks(entities)
});

function extractEntityComponentLinks<TComponent extends BaseComponent>(entities: ReadonlyArray<Entity<TComponent>>): HashMultiMap<string, EntityId> {
	const kv: [string, EntityId][] = fmerge(
		entities.map(entity => entity.components.map(([k, v]) => [k, entity.id] as [string, EntityId]).toArray())
	);

	return HashMultiMap.fromArray(kv, ([key, _]) => key, ([_, value]) => value);
}
