import { List, Map, Set } from "immutable";

import { HashMap } from "../core/utility/hashmap";
import { GenericAction } from "../functional/generic.action";
import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";

export function createEntityReducer<
	TState extends EntitiesState,
	TAction extends GenericAction = GenericAction,
	TEntity extends BaseEntity = BaseEntity,
	TComponent extends BaseComponent = BaseComponent
	>(components: string[], reducer: (action: TAction, ...components: TComponent[]) => Iterable<TComponent>): (state: TState, action: TAction) => TState {
	return updateEntities(components)((entity, action) => {
		const newComponents = reducer(action as TAction, ...components.map(name => entity.components.at(name)! as TComponent));
		const newComponentPairs = List(newComponents).map(component => [component.name, component] as [string, TComponent]);
		const newComponentHash = HashMap.fromMap(Map(newComponentPairs));

		return {
			...entity,
			components: entity.components.union(newComponentHash)
		};
	});
}

function updateEntities<TAction extends GenericAction>(withComponents: string[]) {
	return (reducer: (entity: BaseEntity, action: TAction) => BaseEntity) => {
		return <TState extends EntitiesState>(state: TState, action: TAction): TState => {
			const targetEntities = Set.intersect<EntityId>( List(withComponents).map(componentName => state.componentEntityLinks.at(componentName)) );
			return {
				...(state as EntitiesState),
				entities: targetEntities.reduce((entities, target) => entities.update(target, entity => reducer(entity, action)), state.entities)
			} as TState;
		}
	};
}

function updateComponent<TAction extends GenericAction>(withComponent: string, reducer: (component: BaseComponent, action: TAction) => BaseComponent) {
	return (entity: BaseEntity, action: TAction): BaseEntity => ({
		...entity,
		components: entity.components.update(withComponent, c => reducer(c, action))
	});
}
