import { HashMap } from "../core/utility/hashmap";
import { BaseComponent } from "./component-base.type";
import { BaseEntity, EntityId } from "./entity-base.type";

export type Entity = BaseEntity & {
	readonly id: EntityId;
	readonly components: HashMap<string, BaseComponent>;
};

export const Entity = (name: string, ..._components: BaseComponent[]): Entity => ({
	id: name + EntityId(),
	components: HashMap.fromArray<string, BaseComponent>(_components.map(component => [component.name, component] as [string, BaseComponent]))
});
