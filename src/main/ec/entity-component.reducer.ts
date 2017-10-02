import { GameState } from "../game/game-state.type";
import { CreateEntityAction, EntityComponentAction } from "./entity-component.actions";
import { EntitiesState } from "./entities.state";

export function entityComponentReducer(state: GameState, action: EntityComponentAction): GameState {
	switch (action.type) {
		case EntityComponentAction.CreateEntity:
			return {
				...state,
				entities: state.entities.concat(action.entity)
			};
		case EntityComponentAction.DestroyEntity:
			return {
				...state,
				entities: state.entities.filter(entity => entity.id !== action.id)
			};
		case EntityComponentAction.AttachComponent:
			return {
				...state,
				entities: state.entities.map(entity => entity.id === action.id ? ({
					...entity,
					components: entity.components.concat(action.component)
				}) : entity)
			};
		case EntityComponentAction.DetachComponent:
				return {
					...state,
					entities: state.entities.map(entity => entity.id === action.id ? ({
						...entity,
						components: entity.components.filter(component => component.name !== action.component)
					}) : entity)
				};
		default:
			return state;
	}
}
