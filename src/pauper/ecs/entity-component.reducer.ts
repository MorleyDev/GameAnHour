import { createReducer } from "../redux/create-reducer.func";
import { GenericReducer } from "../redux/reducer.type";
import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { BaseEntity, EntityId } from "./entity-base.type";
import { AttachComponentAction, CreateEntityAction, DestroyEntityAction, DetachComponentAction } from "./entity-component.actions";

export type EntityComponentReducerEvents = {
	readonly attach: (entityId: EntityId, component: BaseComponent) => void;
	readonly detach: (entityId: EntityId, component: BaseComponent) => void;
};

export const createEntityComponentReducer = (events: {
	attach: (entityId: EntityId, component: BaseComponent) => void;
	detach: (entityId: EntityId, component: BaseComponent) => void;
}): GenericReducer => createReducer<EntitiesState>(
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
	const entity = state.entities[id];
	return {
		...(state as any),
		entities: {
			...state.entities,
			[id]: sideEffect(undefined, () => disconnectEntity(state.entities[id], events))
		},
		componentEntityLinks: removeEntityComponentLinks(state.componentEntityLinks, entity)
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
					[component.name]: component
				}
			}
		},
		componentEntityLinks: {
			...state.componentEntityLinks,
			[component.name]: (state.componentEntityLinks[component.name] || []).concat(id)
		}
	};
	events.attach(id, component);
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


// Cheating the immutability by exploiting the lack of laziness!
// ----------------------------------------------------------------

// Given value T, perform some sideEffect using that value and then return T
const sideEffect = <T>(seed: T, sideEffect: (value: T) => void): T => {
	return effectVar(seed, sideEffect(seed));
};

/* Allows for the value passed in to be retrieved and whatever side-effect causing values have been passed in to be evaluated and discarded */
const effectVar = <T, U>(value: T, ..._u: U[]): T => value;
