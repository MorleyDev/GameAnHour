import { BaseEntity, EntityId } from "./entity-base.type";

export type EntitiesState = {
	readonly entities: { readonly [key: string]: BaseEntity };
	readonly componentEntityLinks: { readonly [key: string]: EntityId[] };
};

export const EntitiesState = <TState>(state: TState): TState & EntitiesState => ({
	...(state as any),
	entities: {},
	componentEntityLinks: {}
});
