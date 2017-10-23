import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";
import { Set } from "immutable";

type EntitiesStateMap<TResult, TComponent extends BaseComponent>
	= ((entityId: EntityId, ..._components: TComponent[]) => TResult)
	| ((entityId: EntityId, ..._extra: any[]) => TResult);

export function createEntitiesStateMap<
	TResult,
	TComponent extends BaseComponent = BaseComponent
	>(withComponents: ReadonlyArray<string>, mapper: EntitiesStateMap<TResult, TComponent>): (state: EntitiesState, ..._extra: any[]) => Iterable<TResult> {
	return (state: EntitiesState, ..._extra: any[]): Iterable<TResult> => {
		const entityIdSubset = Set.intersect<EntityId>( withComponents.map(componentName => state.componentEntityLinks.at(componentName)) );
		return state.entities
			.subset(entityIdSubset)
			.map(([entityId, entity]) => ({ entityId, map: entity.components.subset(withComponents) }))
			.map(({ entityId, map }) => (mapper as any)(entityId, ...withComponents.map(component => map.at(component)! as TComponent), ..._extra));
	};
}
