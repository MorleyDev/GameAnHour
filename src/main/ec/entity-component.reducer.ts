import { GameState } from "../game/game-state.type";
import { EntityId } from "./entity-base.type";
import {
	addEntityComponentLink,
	breakEntityComponentLinks,
	dropEntityComponentLink,
	mergeEntityComponentLinks,
} from "./entity-component-flipper.func";
import { EntityComponentAction } from "./entity-component.actions";
import { Entity } from "./entity.type";

export function entityComponentReducer(state: GameState, action: EntityComponentAction): GameState {
	switch (action.type) {
		case EntityComponentAction.CreateEntity:
			return {
				...state,
				entities: state.entities.append(action.entity.id, action.entity),
				componentEntityLinks: mergeEntityComponentLinks(state.componentEntityLinks, action.entity)
			};
		case EntityComponentAction.DestroyEntity:
			return {
				...state,
				entities: state.entities.remove(action.id),
				componentEntityLinks: breakEntityComponentLinks(state.componentEntityLinks, action.id)
			};
		case EntityComponentAction.AttachComponent:
			return {
				...state,
				entities: state.entities.update(action.id, entity => ({
					...entity,
					components: entity.components.concat(action.component)
				})),
				componentEntityLinks: addEntityComponentLink(state.componentEntityLinks, [action.id, action.component.name])
			};
		case EntityComponentAction.DetachComponent:
			return {
				...state,
				entities: state.entities.update(action.id, entity => ({
					...entity,
					components: entity.components.filter(component => component.name !== action.component)
				})),
				componentEntityLinks: dropEntityComponentLink(state.componentEntityLinks, [action.id, action.component])
			};
		default:
			return {
				...state,
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
