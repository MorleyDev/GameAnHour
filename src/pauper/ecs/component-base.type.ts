import { EntityId } from "./entity-base.type";

export type BaseComponent<TName extends string = string, TComponent = {}> = { readonly name: TName; } & TComponent;

export const BaseComponent = <TName extends string, TComponent>(name: TName, data: TComponent): BaseComponent<TName, TComponent> => ({
	name,
	...(data as any)
});
