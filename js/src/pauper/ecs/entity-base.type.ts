import { BaseComponent } from "./component-base.type";
import { uniqueId } from "../utility/unique-id";

export type EntityId = string;
export const EntityId = () => uniqueId().toString();

export type BaseEntity = {
	readonly id: EntityId;
	readonly components: { readonly [component: string]: BaseComponent };
};
