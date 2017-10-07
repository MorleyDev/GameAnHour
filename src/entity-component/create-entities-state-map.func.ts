import { intersect } from "../core/extensions/Array.intersect.func";
import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity } from "./entity-base.type";

export function createEntitiesStateMap<
	TState extends EntitiesState,
	TResult,
	TEntity extends BaseEntity = BaseEntity,
	TComponent extends BaseComponent = BaseComponent
	>(withComponents: string[], mapper: (...components: TComponent[]) => TResult): (state: TState) => TResult[] {
	return (state: TState): TResult[] =>
		intersect(...withComponents.map(componentName => state.componentEntityLinks.at(componentName)))
			.map(entityId => state.entities.at(entityId)!)
			.map(entity => withComponents.map(component => entity.components.at(component)!))
			.map(components => mapper(...components as TComponent[]));
}
