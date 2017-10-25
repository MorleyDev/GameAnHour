import { SpecificReducer, GenericReducer } from "../functional/reducer.type";
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
import { Map, List } from "immutable";

export const entityComponentReducer: GenericReducer = createReducer<EntitiesState>(
	["EC_CreateEntityAction", (state: EntitiesState, action: CreateEntityAction) => createEntity(state, action.id)],
	["EC_DestroyEntityAction", (state: EntitiesState, action: DestroyEntityAction) => destroyEntity(state, action.id)],
	["EC_AttachComponentAction", (state: EntitiesState, action: AttachComponentAction) => attachComponent(state, action.id, action.component)],
	["EC_DetachComponentAction", (state: EntitiesState, action: DetachComponentAction) => detachComponent(state, action.id, action.component)]
) as GenericReducer;

export function createEntity<TState extends EntitiesState>(state: TState, id: EntityId): TState {
	return {
		...(state as any),
		entities: state.entities.concat({ [id]: { id, components: Map<EntityId, BaseComponent>() } })
	};
}

export function destroyEntity<TState extends EntitiesState>(state: TState, id: EntityId): TState {
	const entity = state.entities.get(id);
	if (entity == null) {
		return state;
	}
	return {
		...(state as any),
		entities: state.entities
			.update(id, c => sideEffect(c, disconnectEntity))
			.remove(id),
		componentEntityLinks: entity.components.reduce((ecLinks, _, key: string) => ecLinks.update(key, values => values.filter(value => value !== entity.id)), state.componentEntityLinks)
	};
}

export function attachComponent<TState extends EntitiesState>(state: TState, id: EntityId, component: BaseComponent): TState {
	return {
		...(state as any),
		entities: state.entities.update(id, entity => ({
			...entity,
			components: entity.components.concat({ [component.name]: sideEffect(component, c => connectComponent(c, id)) })
		})),
		componentEntityLinks: state.componentEntityLinks.update(component.name, List(), entityIds => entityIds.push(id))
	};
}

export function detachComponent<TState extends EntitiesState>(state: TState, id: EntityId, componentName: string): TState {
	return {
		...(state as any),
		entities: state.entities.update(id, entity => ({
			...entity,
			components: entity.components
				.update(componentName, c => sideEffect(c, c => disconnectComponent(c, id)))
				.remove(componentName)
		})),
		componentEntityLinks: state.componentEntityLinks.update(componentName, List(), entityIds => entityIds.filter(entityId => entityId === id))
	};
}

function connectComponent(component: BaseComponent<{}>, entityId: EntityId): void {
	return component && component.events && component.events.connect && component.events.connect(component, entityId);
}

function disconnectEntity(entity: BaseEntity): number {
	return entity.components.forEach(component => disconnectComponent(component, entity.id));
}

function disconnectComponent(component: BaseComponent<{}>, entityId: EntityId): void {
	return component.events && component.events.disconnect && component.events.disconnect(component, entityId);
}

// Cheating the immutability by exploiting the lack of laziness!
//----------------------------------------------------------------

// Given value T, perform some sideEffect using that value and then return T
const sideEffect = <T>(seed: T, sideEffect: (value: T) => void): T => {
	return effectVar(seed, sideEffect(seed));
}
/* Allows for the value passed in to be retrieved and whatever side-effect causing values have been passed in to be evaluated and discarded */
const effectVar = <T, U>(value: T, ..._u: U[]): T => value;
