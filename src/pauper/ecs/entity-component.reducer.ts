import { createReducer } from "../redux/create-reducer.func";
import { GenericReducer } from "../redux/reducer.type";
import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";
import { AttachComponentAction, CreateEntityAction, DestroyEntityAction, DetachComponentAction } from "./entity-component.actions";

export type EntityComponentReducerEvents = {
	readonly attach: (entityId: EntityId, component: BaseComponent) => BaseComponent;
	readonly detach: (entityId: EntityId, component: BaseComponent) => void;
};

export const identityEntityComponentReducerEvents: EntityComponentReducerEvents = {
	attach(entityId, component) { return component; },
	detach(entityId, component) { }
};

export const createEntityComponentReducer = (events: EntityComponentReducerEvents = identityEntityComponentReducerEvents): GenericReducer =>
	createReducer<EntitiesState>(
		["EC_CreateEntityAction", (state: EntitiesState, action: CreateEntityAction) => createEntity(state, action.id)],
		["EC_DestroyEntityAction", (state: EntitiesState, action: DestroyEntityAction) => destroyEntity(state, action.id, events)],
		["EC_AttachComponentAction", (state: EntitiesState, action: AttachComponentAction) => attachComponent(state, action.id, action.component, events)],
		["EC_DetachComponentAction", (state: EntitiesState, action: DetachComponentAction) => detachComponent(state, action.id, action.component, events)]
	) as GenericReducer;

export function createEntity<TState extends EntitiesState>(state: TState, id: EntityId): TState {
	return {
		...(state as any),
		entities: {
			...state.entities,
			[id]: { id, components: {} }
		}
	};
}

export function destroyEntity<TState extends EntitiesState>(state: TState, id: EntityId, events: EntityComponentReducerEvents): TState {
	disconnectEntity(state.entities[id], events);
	return {
		...(state as any),
		entities: {
			...state.entities,
			[id]: undefined
		},
		componentEntityLinks: removeEntityComponentLinks(state.componentEntityLinks, state.entities[id])
	};
}

function removeEntityComponentLinks(map: { readonly [key: string]: ReadonlyArray<EntityId> }, entity: BaseEntity): { readonly [key: string]: ReadonlyArray<EntityId> } {
	const result: { [key: string]: ReadonlyArray<EntityId> } = { ...map };
	for (const component in entity.components) {
		result[component] = result[component].filter(f => f !== entity.id);
	}
	return result;
}

export function updateComponentLinks(map: { readonly [key: string]: ReadonlyArray<EntityId> }, entity: BaseEntity, component: string): { readonly [key: string]: ReadonlyArray<EntityId> } {
	const result: { [key: string]: ReadonlyArray<EntityId> } = { ...map };
	result[component] = result[component].filter(f => f !== entity.id);
	return result;
}

export function attachComponent<TState extends EntitiesState>(state: TState, id: EntityId, component: BaseComponent, events: EntityComponentReducerEvents): TState {
	const newState = {
		...(state as any),
		entities: {
			...state.entities,
			[id]: {
				...state.entities[id],
				components: {
					...state.entities[id].components,
					[component.name]: events.attach(id, component)
				}
			}
		},
		componentEntityLinks: {
			...state.componentEntityLinks,
			[component.name]: (state.componentEntityLinks[component.name] || []).concat(id)
		}
	};
	return newState;
}

export function detachComponent<TState extends EntitiesState>(state: TState, id: EntityId, componentName: string, events: EntityComponentReducerEvents): TState {
	events.detach(id, state.entities[id].components[componentName]);
	return {
		...(state as any),
		entities: {
			...state.entities,
			[id]: {
				...state.entities[id],
				components: {
					...state.entities[id].components,
					[componentName]: undefined
				}
			}
		},
		componentEntityLinks: {
			...state.componentEntityLinks,
			[componentName]: state.componentEntityLinks[componentName].filter(v => v !== id)
		}
	};
}


function disconnectEntity(entity: BaseEntity, events: EntityComponentReducerEvents): void {
	for (const componentName in entity.components) {
		events.detach(entity.id, entity.components[componentName]);
	}
}
