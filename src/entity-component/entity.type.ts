import { HashMap } from "../core/utility/hashmap";
import { BaseComponent } from "./component-base.type";
import { BaseEntity, EntityId } from "./entity-base.type";

export type Entity<TComponent extends BaseComponent> = BaseEntity & {
	readonly id: EntityId;
	readonly components: HashMap<string, TComponent>;
};

export const Entity = <TComponent extends BaseComponent>(name: string, ...components: TComponent[]): Entity<TComponent> => ({
	id: name + EntityId(),
	components: HashMap.fromArray<string, TComponent>(components, k => k.name, k => k)
});
