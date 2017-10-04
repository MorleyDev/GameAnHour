import { fmerge } from "../core/extensions/Array.merge.func";
import { HashMultiMap } from "../core/utility/hashmultimap";
import { HashMap } from "../core/utility/hashmap";
import { EntityId } from "./entity-base.type";
import { Entity } from "./entity.type";

export type EntitiesState = {
	readonly entities: HashMap<EntityId, Entity>;
	readonly componentEntityLinks: HashMultiMap<string, EntityId>;
};


export const EntitiesState = <TState>(state: TState, entities: Entity[]): TState & EntitiesState => ({
	...(state as any),
	entities: HashMap.fromArray(entities, entity => entity.id),
	componentEntityLinks: extractEntityComponentLinks(entities)
});

function extractEntityComponentLinks(entities: Entity[]): HashMultiMap<string, EntityId> {
	const kv: [string, EntityId][] = fmerge( entities.map(entity => entity.components.map(([k, v]) => [k, entity.id] as [string, EntityId])) );

	return HashMultiMap.fromArray(kv, ([key, _]) => key, ([_, value]) => value);
}
