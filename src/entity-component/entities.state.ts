import { HashMap } from "../core/utility/hashmap";
import { EntityId } from "./entity-base.type";
import { mergeEntityComponentLinks } from "./entity-component-flipper.func";
import { Entity } from "./entity.type";

export type EntitiesState = {
	readonly entities: HashMap<EntityId, Entity>;
	readonly componentEntityLinks: { [name: string]: EntityId[] | undefined };
};


export const EntitiesState = <TState>(state: TState, entities: Entity[]): TState & EntitiesState => ({
	...(state as any),
	entities: HashMap.fromArray(entities, entity => entity.id),
	componentEntityLinks: entities.reduce((merged, entity) => mergeEntityComponentLinks(merged, entity), {})
});
