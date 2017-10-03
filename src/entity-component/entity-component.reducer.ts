import { GenericAction } from "../functional/generic.action";
import { EntitiesState } from "./entities.state";
import { addEntityComponentLink, breakEntityComponentLinks, dropEntityComponentLink, mergeEntityComponentLinks } from "./entity-component-flipper.func";
import { EntityComponentAction } from "./entity-component.actions";

export function entityComponentReducer<TState extends EntitiesState>(state: TState, action: GenericAction): TState {
	switch (action.type) {
		case EntityComponentAction.CreateEntity:
			return {
				...(state as any),
				entities: state.entities.append(action.entity.id, action.entity),
				componentEntityLinks: mergeEntityComponentLinks(state.componentEntityLinks, action.entity)
			};
		case EntityComponentAction.DestroyEntity:
			return {
				...(state as any),
				entities: state.entities.remove(action.id),
				componentEntityLinks: breakEntityComponentLinks(state.componentEntityLinks, action.id)
			};
		case EntityComponentAction.AttachComponent:
			return {
				...(state as any),
				entities: state.entities.update(action.id, entity => ({
					...entity,
					components: entity.components.concat(action.component)
				})),
				componentEntityLinks: addEntityComponentLink(state.componentEntityLinks, [action.id, action.component.name])
			};
		case EntityComponentAction.DetachComponent:
			return {
				...(state as any),
				entities: state.entities.update(action.id, entity => ({
					...entity,
					components: entity.components.filter(component => component.name !== action.component)
				})),
				componentEntityLinks: dropEntityComponentLink(state.componentEntityLinks, [action.id, action.component])
			};
		default:
			return {
				...(state as any),
				entities: state.entities.updateWhere(
					([entityId, entity]) => entity.components.find(v => v.reduce != null) != null,
					([_, entity]) =>
						entity.components.reduce((prev, curr) => curr.reduce != null
							? curr.reduce(prev, action)
							: prev, entity)
				)
			};
	}
}
