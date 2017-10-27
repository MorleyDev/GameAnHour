import { Map } from "immutable";

import { BaseComponent } from "./component-base.type";
import { BaseEntity, EntityId } from "./entity-base.type";

export type Entity = BaseEntity & {
	readonly id: EntityId;
	readonly components: Map<string, BaseComponent>;
};

export const Entity = (name: string, ..._components: BaseComponent[]): Entity => ({
	id: name + EntityId(),
	components: Map<string, BaseComponent>(_components.map(component => [component.name, component] as [string, BaseComponent]))
});
