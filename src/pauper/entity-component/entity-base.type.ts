import { Map } from "immutable";
import { BaseComponent } from "./component-base.type";

export type EntityId = string;

let _nextId = 0;
export const EntityId = () => (_nextId++).toString();

export type BaseEntity = {
	readonly id: EntityId;
	readonly components: Map<string, BaseComponent>;
};
