import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";
import { Set } from "immutable";

export function createEntitiesStateMap<
	TState extends EntitiesState,
	TResult,
	TEntity extends BaseEntity = BaseEntity,
	TComponent extends BaseComponent = BaseComponent
	>(withComponents: string[], mapper: (entityId: EntityId, ...components: TComponent[]) => TResult): (state: TState) => Iterable<TResult> {
	return (state: TState): Iterable<TResult> => {
		const entityIdSubset = Set.intersect<EntityId>( withComponents.map(componentName => state.componentEntityLinks.at(componentName)) );
		return state.entities
			.subset(entityIdSubset)
			.map(([entityId, entity]) => ({ entityId, map: entity.components.subset(withComponents) }))
			.map(({ entityId, map }) => mapper(entityId, ...withComponents.map(component => map.at(component)! as TComponent)));
	};
}
