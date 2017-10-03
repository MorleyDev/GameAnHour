import { BaseComponent } from "./component-base.type";

export type EntityId = string;
export const EntityId = () => "imanid";

export type BaseEntity = {
	id: EntityId;
	components: BaseComponent[];
};
