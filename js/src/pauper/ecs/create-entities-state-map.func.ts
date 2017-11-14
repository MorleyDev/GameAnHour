import { getComponentsOfEntity } from "./get-components-of-entity.func";
import { getEntitiesByComponents } from "./get-entities-by-components.func";
import { createEntitiesStateFilter } from "./create-entities-state-filter.func";
import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { EntityId } from "./entity-base.type";

type EntitiesStateMap<TResult>
	= ((entityId: EntityId, component: BaseComponent<string, any>, ..._extra: any[]) => TResult)
	| ((entityId: EntityId, component1: BaseComponent<string, any>, component2: BaseComponent<string, any>, ..._extra: any[]) => TResult)
	| ((entityId: EntityId, component1: BaseComponent<string, any>, component2: BaseComponent<string, any>, component3: BaseComponent<string, any>, ..._extra: any[]) => TResult);

export function createEntitiesStateMap<TResult>(
	withComponents: ReadonlyArray<string>,
	mapper: EntitiesStateMap<TResult>
): (state: EntitiesState, ..._extra: any[]) => Iterable<TResult> {
	const innerGetEntitiesByComponents = getEntitiesByComponents(withComponents);
	const innerGetComponentsOfEntity = getComponentsOfEntity(withComponents);

	return function * (state: EntitiesState, ...extra: any[]): Iterable<TResult> {
		for (const entityId of innerGetEntitiesByComponents(state)) {
			const components = withComponents.map(component => state.entities[entityId].components[component]);
			yield (mapper as any)(entityId, ...components, ...extra);
		}
	};
}
