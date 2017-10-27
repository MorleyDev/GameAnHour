import { List, Map, Set } from "immutable";

import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { EntityId } from "./entity-base.type";

type EntitiesStateFilter
	= ((component: BaseComponent<string, any>, ..._extra: any[]) => boolean)
	| ((component1: BaseComponent<string, any>, component2: BaseComponent<string, any>, ..._extra: any[]) => boolean)
	| ((component1: BaseComponent<string, any>, component2: BaseComponent<string, any>, component3: BaseComponent<string, any>, ..._extra: any[]) => boolean);

export function createEntitiesStateFilter(withComponents: ReadonlyArray<string>, filter: EntitiesStateFilter): (state: EntitiesState, ..._extra: any[]) => Iterable<EntityId> {
	return (state: EntitiesState, ..._extra: any[]): Iterable<EntityId> => {
		const entityIdSubset = Set.intersect<EntityId>(withComponents.map(componentName => state.componentEntityLinks.get(componentName, List())));
		return subset(state.entities, entityIdSubset)
			.map((entity, entityId) => ({ entityId, map: subset(entity.components, withComponents) }))
			.filter(({ entityId, map }) => (filter as any)(...withComponents.map(component => map.get(component)), ..._extra))
			.map(({ entityId }) => entityId)
			.values();
	};
}

function subset<TKey, TValue>(map: Map<TKey, TValue>, keys: Iterable<TKey>): Map<TKey, TValue> {
	const keySet = Set(keys);
	return map.filter((v: TValue, k: TKey) => keySet.has(k));
}