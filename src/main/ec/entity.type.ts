import { Component } from "./component.type";
import { BaseEntity } from "./entity-base.type";

export type Entity = {
	readonly id: Symbol;
	readonly components: ReadonlyArray<Component>;
};

export const Entity = (...components: Component[]): Entity => ({ id: Symbol(), components });
