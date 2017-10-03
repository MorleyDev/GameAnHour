import { EntityId } from "./entity-base.type";
import { Entity } from "./entity.type";

export function getEntityComponentLinks(entity: Entity): { [name: string]: EntityId[] | undefined } {
	return entity.components.groupBy(c => c.name, () => entity.id);
}

export function mergeEntityComponentLinks(lhs: { [name: string]: EntityId[] | undefined }, rhs: Entity): { [name: string]: EntityId[] | undefined } {
	const rLinks = getEntityComponentLinks(rhs);
	const out: { [name: string]: EntityId[] | undefined } = { ...lhs };
	for (let key in rLinks) {
		out[key] = [...out[key] || [], ...rLinks[key] || []];
	}
	return out;
}

export function breakEntityComponentLinks(lhs: { [name: string]: EntityId[] | undefined }, rhs: EntityId) {
	const out: { [name: string]: EntityId[] | undefined } = { };
	for (let key in lhs) {
		out[key] = (lhs[key] || []).filter(k => k !== rhs);
	}
	return out;
}

export function addEntityComponentLink(lhs: { [name: string]: EntityId[] | undefined }, rhs: [EntityId, string]) {
	return {
		...lhs,
		[rhs[1]]: (lhs[rhs[1]] || []).concat(rhs[0])
	};
}

export function dropEntityComponentLink(lhs: { [name: string]: EntityId[] | undefined }, rhs: [EntityId, string]) {
	return {
		...lhs,
		[rhs[1]]: (lhs[rhs[1]] || []).filter(kv => kv !== rhs[0])
	};
}
