import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";
import { Set } from "immutable";

type EntitiesStateFilter<TComponent extends BaseComponent>
	= ((component: TComponent, ..._extra: any[]) => boolean)
	| ((component1: TComponent, component2: TComponent, ..._extra: any[]) => boolean)
	| ((component1: TComponent, component2: TComponent, component3: TComponent, ..._extra: any[]) => boolean);

export function createEntitiesStateFilter<
	TComponent extends BaseComponent = BaseComponent
	>(withComponents: ReadonlyArray<string>, filter: EntitiesStateFilter<TComponent>): (state: EntitiesState, ..._extra: any[]) => Iterable<EntityId> {
	return (state: EntitiesState, ..._extra: any[]): Iterable<EntityId> => {
		const entityIdSubset = Set.intersect<EntityId>(withComponents.map(componentName => state.componentEntityLinks.at(componentName)));
		return state.entities
			.subset(entityIdSubset)
			.map(([entityId, entity]) => ({ entityId, map: entity.components.subset(withComponents) }))
			.filter(({ entityId, map }) => (filter as any)(...withComponents.map(component => map.at(component)! as TComponent), ..._extra))
			.map(({ entityId }) => entityId);
	};
}
