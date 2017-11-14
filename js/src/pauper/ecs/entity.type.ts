import { BaseComponent } from "./component-base.type";
import { BaseEntity, EntityId } from "./entity-base.type";

export type Entity = BaseEntity & {
	readonly id: EntityId;
};

export const Entity = (name: string): Entity => ({
	id: name + EntityId(),
	components: { }
});
