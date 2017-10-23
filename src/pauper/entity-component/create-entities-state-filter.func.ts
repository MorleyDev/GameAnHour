import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";
import { Set } from "immutable";

type EntitiesStateFilter
	= ((component: BaseComponent, ..._extra: any[]) => boolean)
	| ((component1: BaseComponent, component2: BaseComponent, ..._extra: any[]) => boolean)
	| ((component1: BaseComponent, component2: BaseComponent, component3: BaseComponent, ..._extra: any[]) => boolean);

export function createEntitiesStateFilter(withComponents: ReadonlyArray<string>, filter: EntitiesStateFilter): (state: EntitiesState, ..._extra: any[]) => Iterable<EntityId> {
	return (state: EntitiesState, ..._extra: any[]): Iterable<EntityId> => {
		const entityIdSubset = Set.intersect<EntityId>(withComponents.map(componentName => state.componentEntityLinks.at(componentName)));
		return state.entities
			.subset(entityIdSubset)
			.map(([entityId, entity]) => ({ entityId, map: entity.components.subset(withComponents) }))
			.filter(({ entityId, map }) => (filter as any)(...withComponents.map(component => map.at(component)!), ..._extra))
			.map(({ entityId }) => entityId);
	};
}
