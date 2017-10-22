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
	["EC_CreateEntityAction", (state: EntitiesState, action: CreateEntityAction) => createEntity(state, action.id)],
	["EC_DestroyEntityAction", (state: EntitiesState, action: DestroyEntityAction) => destroyEntity(state, action.id)],
	["EC_AttachComponentAction", (state: EntitiesState, action: AttachComponentAction) => attachComponent(state, action.id, action.component)],
	["EC_DetachComponentAction", (state: EntitiesState, action: DetachComponentAction) => detachComponent(state, action.id, action.component)]
) as GenericReducer;

export function createEntity<TState extends EntitiesState>(state: TState, id: EntityId): TState {
	return {
		...(state as any),
		entities: state.entities.append(id, { id, components: HashMap<EntityId, BaseComponent>() }),
	};
}

export function destroyEntity<TState extends EntitiesState>(state: TState, id: EntityId): TState {
	return {
		...(state as any),
		entities: state.entities.update(id, c => sideEffect(c, disconnectEntity)).remove(id),
		componentEntityLinks: state.componentEntityLinks.filter(([_, entityId]) => entityId !== id)
	};
}

export function attachComponent<TState extends EntitiesState>(state: TState, id: EntityId, component: BaseComponent): TState {
	return {
		...(state as any),
		entities: state.entities.update(id, entity => ({
			...entity,
			components: entity.components.append(component.name, sideEffect(component, connectComponent))
		})),
		componentEntityLinks: state.componentEntityLinks.append(component.name, id)
	};
}

export function detachComponent<TState extends EntitiesState>(state: TState, id: EntityId, componentName: string): TState {
	return {
		...(state as any),
		entities: state.entities.update(id, entity => ({
			...entity,
			components: entity.components
				.update(componentName, c => sideEffect(c, disconnectComponent))
				.remove(componentName)
		})),
		componentEntityLinks: state.componentEntityLinks.removeWhere(componentName, entityId => entityId === id)
	};
}

function connectComponent(component: BaseComponent): void {
	return component.events && component.events.disconnect && component.events.connect(component);
}

function disconnectEntity(entity: BaseEntity): void {
	return entity.components.forEach(([_, component]) => disconnectComponent(component));
}

function disconnectComponent(component: BaseComponent): void {
	return component.events && component.events.disconnect && component.events.disconnect(component);
}

// Cheating the immutability by exploiting the lack of laziness!
//----------------------------------------------------------------

// Given value T, perform some sideEffect using that value and then return T
const sideEffect = <T>(seed: T, sideEffect: (value: T) => void): T => {
	return effectVar(seed, sideEffect(seed));
}
/* Allows for the value passed in to be retrieved and whatever side-effect causing values have been passed in to be evaluated and discarded */
const effectVar = <T, U>(value: T, ..._u: U[]): T => value;
