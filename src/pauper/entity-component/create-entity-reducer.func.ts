import { SpecificReducer } from "../functional/reducer.type";
import { List, Map, Set } from "immutable";

import { GenericAction } from "../functional/generic.action";
import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";

export function createEntityReducer<TState extends EntitiesState, TAction extends GenericAction = GenericAction, TEntity extends BaseEntity = BaseEntity>(
	components: ReadonlyArray<string>,
	reducer: (state: TState, action: TAction, ..._components: BaseComponent[]) => Iterable<BaseComponent>
): SpecificReducer<TState, TAction> {
	return bindEntitiesToReducer<TState, TAction>(components, (state, entity, action) => {
		const newComponents = reducer(state, action as TAction, ...components.map(name => entity.components.get(name)));
		const newComponentPairs = List(newComponents).map(component => [component.name, component] as [string, BaseComponent]);
		const newComponentHash = Map<EntityId, BaseComponent>(newComponentPairs);

		return {
			...entity,
			components: entity.components.merge(newComponentHash)
		};
	});
}

type EntityStateReducer<TState, TAction> = (state: TState, entity: BaseEntity, action: TAction) => BaseEntity;

const bindEntitiesToReducer = <TState extends EntitiesState, TAction extends GenericAction>(withComponents: ReadonlyArray<string>, entityStateReducer: EntityStateReducer<TState, TAction>): SpecificReducer<TState, TAction> =>
	(state, action) => ({
		...(state as EntitiesState),
		entities: Set.intersect<EntityId>(List(withComponents)
			.map(componentName => state.componentEntityLinks.get(componentName, List())))
			.reduce((entities, target) => entities.update(target, entity => entityStateReducer(state, entity, action)), state.entities)
	} as TState);


type EntityReducer<TAction> = (entity: BaseEntity, action: TAction) => BaseEntity;
type ComponentReducer<TAction> = (component: BaseComponent, action: TAction) => BaseComponent;

const bindComponentToReducer = <TAction extends GenericAction>(withComponent: string, reducer: ComponentReducer<TAction>): EntityReducer<TAction> =>
	(entity, action) => ({
		...entity,
		components: entity.components.update(withComponent, c => reducer(c, action))
	});
