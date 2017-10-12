import { SpecificReducer, GenericReducer } from "../functional/reducer.type";
import { HashMap } from "../core/utility/hashmap";
import { fzip } from "../core/extensions/Array.zip.func";
import { intersect } from "../core/extensions/Array.intersect.func";
import { BaseComponent } from "./component-base.type";
import { GenericAction } from "../functional/generic.action";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";
import {
	AttachComponentAction,
	CreateEntityAction,
	DestroyEntityAction,
	DetachComponentAction,
	EntityComponentAction,
} from "./entity-component.actions";
import { createReducer } from "../functional/create-reducer.func";

export const entityComponentReducer: GenericReducer = createReducer<EntitiesState, GenericAction>(
	["EC_CreateEntityAction", (state: EntitiesState, action: CreateEntityAction) => ({
		...state,
		entities: state.entities.append(action.id, { id: action.id, components: HashMap<EntityId, BaseComponent>() }),
	})],
	["EC_DestroyEntityAction", (state: EntitiesState, action: DestroyEntityAction) => ({
		...state,
		entities: state.entities.remove(action.id),
		componentEntityLinks: state.componentEntityLinks.filter(([_, entityId]) => entityId === action.id)
	})],
	["EC_AttachComponentAction", (state: EntitiesState, action: AttachComponentAction) => ({
		...state,
		entities: state.entities.update(action.id, entity => ({
			...entity,
			components: entity.components.append(action.component.name, action.component)
		})),
		componentEntityLinks: state.componentEntityLinks.append(action.component.name, action.id)
	})],
	["EC_DetachComponentAction", (state: EntitiesState, action: DetachComponentAction) => ({
		...state,
		entities: state.entities.update(action.id, entity => ({
			...entity,
			components: entity.components.remove(action.component)
		})),
		componentEntityLinks: state.componentEntityLinks.removeWhere(action.component, entityId => entityId === action.id)
	})]
) as GenericReducer;
