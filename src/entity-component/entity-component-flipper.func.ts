import { fgroupBy } from "../core/extensions/Array.groupBy.func";
import { EntityId } from "./entity-base.type";
import { Entity } from "./entity.type";

export function getEntityComponentLinks(entity: Entity): { [name: string]: ReadonlyArray<EntityId> | undefined } {
	return fgroupBy(entity.components, c => c.name, () => entity.id);
}

export function mergeEntityComponentLinks(lhs: { [name: string]: ReadonlyArray<EntityId> | undefined }, rhs: Entity): { [name: string]: ReadonlyArray<EntityId> | undefined } {
	const rLinks = getEntityComponentLinks(rhs);
	const out: { [name: string]: ReadonlyArray<EntityId> | undefined } = { ...lhs };
	for (let key in rLinks) {
		out[key] = [...out[key] || [], ...rLinks[key] || []];
	}
	return out;
}

export function breakEntityComponentLinks(lhs: { [name: string]: ReadonlyArray<EntityId> | undefined }, rhs: EntityId) {
	const out: { [name: string]: ReadonlyArray<EntityId> | undefined } = { };
	for (let key in lhs) {
		out[key] = (lhs[key] || []).filter(k => k !== rhs);
	}
	return out;
}

export function addEntityComponentLink(lhs: { [name: string]: ReadonlyArray<EntityId> | undefined }, rhs: [EntityId, string]) {
	return {
		...lhs,
		[rhs[1]]: (lhs[rhs[1]] || []).concat(rhs[0])
	};
}

export function dropEntityComponentLink(lhs: { [name: string]: ReadonlyArray<EntityId> | undefined }, rhs: [EntityId, string]) {
	return {
		...lhs,
		[rhs[1]]: (lhs[rhs[1]] || []).filter(kv => kv !== rhs[0])
	};
}
