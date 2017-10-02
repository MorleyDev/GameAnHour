import { Component } from "./component.type";
import { Entity } from "./entity.type";
import { GameState } from "../game/game-state.type";
import { CreateEntityAction, EntityComponentAction } from "./entity-component.actions";
import { EntitiesState } from "./entities.state";

export function entityComponentReducer(state: GameState, action: EntityComponentAction): GameState {
	switch (action.type) {
		case EntityComponentAction.CreateEntity:
			return {
				...state,
				entities: state.entities.concat(action.entity),
				componentEntityLinks: mergeEntityComponentLinks(state.componentEntityLinks, action.entity)
			};
		case EntityComponentAction.DestroyEntity:
			return {
				...state,
				entities: state.entities.filter(entity => entity.id !== action.id),
				componentEntityLinks: breakEntityComponentLinks(state.componentEntityLinks, action.id)
			};
		case EntityComponentAction.AttachComponent:
			return {
				...state,
				entities: state.entities.map(entity => entity.id === action.id ? ({
					...entity,
					components: entity.components.concat(action.component)
				}) : entity),
				componentEntityLinks: addEntityComponentLink(state.componentEntityLinks, [action.id, action.component.name])
			};
		case EntityComponentAction.DetachComponent:
				return {
					...state,
					entities: state.entities.map(entity => entity.id === action.id ? ({
						...entity,
						components: entity.components.filter(component => component.name !== action.component)
					}) : entity),
					componentEntityLinks: dropEntityComponentLink(state.componentEntityLinks, [action.id, action.component])
				};
		default:
			return state;
	}
}

function getEntityComponentLinks(entity: Entity): { [name: string]: Symbol[] | undefined } {
	return entity.components.groupBy(c => c.name, () => entity.id);
}

function mergeEntityComponentLinks(lhs: { [name: string]: Symbol[] | undefined }, rhs: Entity): { [name: string]: Symbol[] | undefined } {
	const rLinks = getEntityComponentLinks(rhs);
	const out: { [name: string]: Symbol[] | undefined } = { ...lhs };
	for (let key in rLinks) {
		out[key] = (out[key] || []).concat(rLinks[key] || []);
	}
	return out;
}

function breakEntityComponentLinks(lhs: { [name: string]: Symbol[] | undefined }, rhs: Symbol) {
	const out: { [name: string]: Symbol[] | undefined } = { };
	for (let key in lhs) {
		out[key] = (lhs[key] || []).filter(k => k !== rhs);
	}
	return out;
}

function addEntityComponentLink(lhs: { [name: string]: Symbol[] | undefined }, rhs: [Symbol, string]) {
	return {
		...lhs,
		[rhs[1]]: (lhs[rhs[1]] || []).concat(rhs[0])
	};
}

function dropEntityComponentLink(lhs: { [name: string]: Symbol[] | undefined }, rhs: [Symbol, string]) {
	return {
		...lhs,
		[rhs[1]]: (lhs[rhs[1]] || []).filter(kv => kv !== rhs[0])
	};
}
