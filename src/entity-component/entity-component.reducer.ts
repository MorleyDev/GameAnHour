import { EntityId } from "./entity-base.type";
import { GenericAction } from "../functional/generic.action";
import { EntitiesState } from "./entities.state";
import { EntityComponentAction } from "./entity-component.actions";

export function entityComponentReducer<TState extends EntitiesState>(state: TState, action: GenericAction): TState {
	if (EntityComponentAction.CreateEntity(action)) {
		return {
			...(state as EntitiesState),
			entities: state.entities.append(action.entity.id, action.entity),
			componentEntityLinks: state.componentEntityLinks.appendSet(action.entity.components.map(([_, component]) => [_, action.entity.id] as [string, EntityId]))
		} as TState;
	} else if (EntityComponentAction.DestroyEntity(action)) {
		return {
			...(state as EntitiesState),
			entities: state.entities.remove(action.id),
			componentEntityLinks: state.componentEntityLinks.filter(([_, entityId]) => entityId === action.id)
		} as TState;
	} else if (EntityComponentAction.AttachComponent(action)) {
		return {
			...(state as EntitiesState),
			entities: state.entities.update(action.id, entity => ({
				...entity,
				components: entity.components.append(action.component.name, action.component)
			})),
			componentEntityLinks: state.componentEntityLinks.append(action.component.name, action.id)
		} as TState;
	} else if (EntityComponentAction.DetachComponent(action)) {
		return {
			...(state as EntitiesState),
			entities: state.entities.update(action.id, entity => ({
				...entity,
				components: entity.components.remove(action.component)
			})),
			componentEntityLinks: state.componentEntityLinks.removeWhere(action.component, entityId => entityId === action.id)

		} as TState;
	} else {
		const entityTargets: EntityId[] | undefined = action["targetEntities"];

		if (entityTargets != null) {
			return {
				...(state as EntitiesState),
				entities: entityTargets.reduce((entities, target) =>
					entities.update(target, entity => ({
						...entity,
						components: entity.components.updateWhere(([_, c]) => c.reduce != null, ([_, c]) => c.reduce!(c, action))
					})), state.entities)
			} as TState;
		}

		return {
			...(state as EntitiesState),
			entities: state.entities.hmap(([_, entity]) => [_, ({
				...entity,
				components: entity.components.updateWhere(([_, c]) => c.reduce != null, ([_, c]) => c.reduce!(c, action))
			})])
		} as TState;
	}
}
