import { intersect } from "../core/extensions/Array.intersect.func";
import { fzip } from "../core/extensions/Array.zip.func";
import { HashMap } from "../core/utility/hashmap";
import { GenericAction } from "../functional/generic.action";
import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity } from "./entity-base.type";

export function createEntityReducer<
	TState extends EntitiesState,
	TAction extends GenericAction = GenericAction,
	TEntity extends BaseEntity = BaseEntity,
	TComponent extends BaseComponent = BaseComponent
	>(components: string[], reducer: (action: TAction, ...components: TComponent[]) => TComponent[]): (state: TState, action: TAction) => TState {
	return updateEntities(components)((entity, action) => {
		const newComponents = fzip(components, reducer(action as TAction, ...components.map(name => entity.components.at(name)) as TComponent[]));
		const newComponentHash = HashMap.fromArray(newComponents, k => k[0], k => k[1]);

		return {
			...entity,
			components: entity.components.union(newComponentHash)
		};
	});
}

function updateEntities<TAction extends GenericAction>(withComponents: string[]) {
	return (reducer: (entity: BaseEntity, action: TAction) => BaseEntity) => {
		return <TState extends EntitiesState>(state: TState, action: TAction): TState => {
			const targetEntities = intersect(...withComponents.map(componentName => state.componentEntityLinks.at(componentName)));
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
