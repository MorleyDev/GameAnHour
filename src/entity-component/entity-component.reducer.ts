import { HashMap } from "../core/utility/hashmap";
import { fzip } from "../core/extensions/Array.zip.func";
import { intersect } from "../core/extensions/Array.intersect.func";
import { BaseComponent } from "./component-base.type";
import { GenericAction } from "../functional/generic.action";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";
import { EntityComponentAction } from "./entity-component.actions";

export function entityComponentReducer<TState extends EntitiesState>(state: TState, action: GenericAction): TState {
	if (EntityComponentAction.CreateEntity(action)) {
		return {
			...(state as EntitiesState),
			entities: state.entities.append(action.entity.id, action.entity),
			componentEntityLinks: state.componentEntityLinks.appendMap(action.entity.components.hmap(([_, component]) => [_, action.entity.id]))
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
		return state;
	}
}
