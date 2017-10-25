import { List, Map, Set } from "immutable";

import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { EntityId } from "./entity-base.type";

type EntitiesStateMap<TResult>
	= ((entityId: EntityId, component: BaseComponent, ..._extra: any[]) => TResult)
	| ((entityId: EntityId, component1: BaseComponent, component2: BaseComponent, ..._extra: any[]) => TResult)
	| ((entityId: EntityId, component1: BaseComponent, component2: BaseComponent, component3: BaseComponent, ..._extra: any[]) => TResult)

export function createEntitiesStateMap<TResult, TComponent extends BaseComponent = BaseComponent>(
	withComponents: ReadonlyArray<string>,
	mapper: EntitiesStateMap<TResult>
): (state: EntitiesState, ..._extra: any[]) => Iterable<TResult> {
	return (state: EntitiesState, ..._extra: any[]): Iterable<TResult> => {
		const entityIdSubset = Set.intersect<EntityId>( withComponents.map(componentName => state.componentEntityLinks.get(componentName, List())) );
		return subset(state.entities, entityIdSubset)
			.map((entity, entityId) => ({ entityId, map: subset(entity.components, withComponents) }))
			.map(({ entityId, map }) => (mapper as any)(entityId, ...withComponents.map(component => map.get(component)), ..._extra))
			.values();
	};
}

function subset<TKey, TValue>(map: Map<TKey, TValue>, keys: Iterable<TKey>): Map<TKey, TValue> {
	const keySet = Set(keys);
	return map.filter((v: TValue, k: TKey) => keySet.has(k));
}