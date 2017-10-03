import { Component } from "./component.type";
import { BaseEntity, EntityId } from "./entity-base.type";

export type Entity = {
	readonly id: EntityId;
	readonly components: ReadonlyArray<Component>;
};

export const Entity = (...components: Component[]): Entity => ({ id: EntityId(), components });
