import { HashMap } from "../core/utility/hashmap";
import { BaseComponent } from "./component-base.type";

export type EntityId = string;

let _nextId = 0;
export const EntityId = () => (_nextId++).toString();

export type BaseEntity = {
	readonly id: EntityId;
	readonly components: HashMap<string, BaseComponent>;
};
