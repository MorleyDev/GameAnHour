import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";
import { Set } from "immutable";

type EntitiesStateMap<TResult>
	= ((entityId: EntityId, component: BaseComponent, ..._extra: any[]) => TResult)
	| ((entityId: EntityId, component1: BaseComponent, component2: BaseComponent, ..._extra: any[]) => TResult)
	| ((entityId: EntityId, component1: BaseComponent, component2: BaseComponent, component3: BaseComponent, ..._extra: any[]) => TResult)

export function createEntitiesStateMap<TResult, TComponent extends BaseComponent = BaseComponent>(
	withComponents: ReadonlyArray<string>,
	mapper: EntitiesStateMap<TResult>
): (state: EntitiesState, ..._extra: any[]) => Iterable<TResult> {
	return (state: EntitiesState, ..._extra: any[]): Iterable<TResult> => {
		const entityIdSubset = Set.intersect<EntityId>( withComponents.map(componentName => state.componentEntityLinks.at(componentName)) );
		return state.entities
			.subset(entityIdSubset)
			.map(([entityId, entity]) => ({ entityId, map: entity.components.subset(withComponents) }))
			.map(({ entityId, map }) => (mapper as any)(entityId, ...withComponents.map(component => map.at(component)!), ..._extra));
	};
}
