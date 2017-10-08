import { intersect } from "../core/extensions/Array.intersect.func";
import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";

export function createEntitiesStateMap<
	TState extends EntitiesState,
	TResult,
	TEntity extends BaseEntity = BaseEntity,
	TComponent extends BaseComponent = BaseComponent
	>(withComponents: string[], mapper: (entityId: EntityId, ...components: TComponent[]) => TResult): (state: TState) => TResult[] {
	return (state: TState): TResult[] => {
		const entityIdSubset = intersect(...withComponents.map(componentName => state.componentEntityLinks.at(componentName)));
		return state.entities
			.subset(entityIdSubset)
			.map(([entityId, entity]) => ({ entityId, map: entity.components.subset(withComponents) }))
			.map(({ entityId, map }) => mapper(entityId, ...map.values() as TComponent[]))
	};
}
