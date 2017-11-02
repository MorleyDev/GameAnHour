import { getComponentsOfEntity } from "./get-components-of-entity.func";
import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { EntityId } from "./entity-base.type";

type EntitiesStateFilter
	= ((component: BaseComponent<string, any>, ..._extra: any[]) => boolean)
	| ((component1: BaseComponent<string, any>, component2: BaseComponent<string, any>, ..._extra: any[]) => boolean)
	| ((component1: BaseComponent<string, any>, component2: BaseComponent<string, any>, component3: BaseComponent<string, any>, ..._extra: any[]) => boolean);

export function createEntitiesStateFilter(withComponents: ReadonlyArray<string>, filter: EntitiesStateFilter): (state: EntitiesState, ..._extra: any[]) => Iterable<EntityId> {
	const innerGetComponentsOfEntity = getComponentsOfEntity(withComponents);

	return function * (state: EntitiesState, ..._extra: any[]): Iterable<EntityId> {
		for (const entityId in state.entities) {
			for (const component of withComponents) {
				if (!(state.componentEntityLinks[component] || []).includes(entityId)) {
					continue;
				}

				const entity = state.entities[entityId]!;
				if ((filter as any)(...innerGetComponentsOfEntity(entity), ..._extra)) {
					yield entityId;
				}
			}
		}
	};
}
