import { Entity } from "./entity.type";

export type EntitiesState = {
	readonly entities: Entity[]
};

export const EntitiesState = <TState>(state: TState, entities: Entity[]): TState & EntitiesState => ({
	...(state as any),
	entities
});
