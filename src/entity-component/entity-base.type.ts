import { BaseComponent } from "./component-base.type";

export type EntityId = string;

let nextId = 0;
export const EntityId = () => (nextId++).toString();

export type BaseEntity = {
	id: EntityId;
	components: BaseComponent[];
};
