import { HashMap } from "../core/utility/hashmap";
import { Component } from "./component.type";
import { EntityId } from "./entity-base.type";

export type Entity = {
	readonly id: EntityId;
	readonly components: HashMap<string, Component>;
};

export const Entity = (name: string, ...components: Component[]): Entity => ({
	id: name + EntityId(),
	components: HashMap.fromArray<string, Component>(components, k => k.name)
});
