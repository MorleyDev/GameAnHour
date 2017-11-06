import { getComponentsOfEntity } from "./get-components-of-entity.func";
import { getEntitiesByComponents } from "./get-entities-by-components.func";
import { GenericAction } from "../redux/generic.action";
import { SpecificReducer } from "../redux/reducer.type";
import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";

export function createEntityReducer<TState extends EntitiesState, TAction extends GenericAction = GenericAction, TEntity extends BaseEntity = BaseEntity>(
	components: ReadonlyArray<string>,
	reducer: (state: TState, action: TAction, ..._components: BaseComponent<string, any>[]) => Iterable<BaseComponent>
): SpecificReducer<TState, TAction> {
	const findEntities = getEntitiesByComponents(components);
	const getComponents = getComponentsOfEntity(components);

	return (state, action) => {
		const targetEntities = findEntities(state);
		const clone: TState & { entities: { [key: string]: BaseEntity } } = ({
			...(state as any),
			entities: {
				...state.entities
			}
		});
		for (const entityId of targetEntities) {
			const targetEntity = state.entities[entityId];
			const components = getComponents(targetEntity);
			const newComponents = reducer(state, action, ...components);
			const cloneComponents: { [component: string]: BaseComponent } = ({ ...clone.entities[entityId].components });
			for (const component of newComponents) {
				cloneComponents[component.name] = component;
			}
			clone.entities[entityId] = ({
				...state.entities[entityId],
				components: cloneComponents
			});
		}
		return clone;
	};
}
