import { Component } from "./component.type";
import { Entity } from "./entity.type";

export type CreateEntityAction = { type: "EC_CREATE_ENTITY", entity: Entity };
export const CreateEntityAction = (entity: Entity): CreateEntityAction => ({ type: "EC_CREATE_ENTITY", entity });

export type DestroyEntityAction = { type: "EC_DESTROY_ENTITY", id: Symbol };
export const DestroyEntityAction = (id: Symbol): DestroyEntityAction => ({ type: "EC_DESTROY_ENTITY", id });

export type AttachComponentAction = { type: "EC_ATTACH_COMPONENT", id: Symbol, component: Component };
export const AttachComponentAction = (id: Symbol, component: Component): AttachComponentAction => ({ type: "EC_ATTACH_COMPONENT", id, component });

export type DetachComponentAction = { type: "EC_DETACH_COMPONENT", id: Symbol, component: string };
export const DetachComponentAction = (id: Symbol, component: string): DetachComponentAction => ({ type: "EC_DETACH_COMPONENT", id, component });

export const EntityComponentAction: {
	CreateEntity: "EC_CREATE_ENTITY";
	DestroyEntity: "EC_DESTROY_ENTITY";
	AttachComponent: "EC_ATTACH_COMPONENT";
	DetachComponent: "EC_DETACH_COMPONENT";
} = {
	CreateEntity: "EC_CREATE_ENTITY",
	DestroyEntity: "EC_DESTROY_ENTITY",
	AttachComponent: "EC_ATTACH_COMPONENT",
	DetachComponent: "EC_DETACH_COMPONENT"
};
export type EntityComponentAction = CreateEntityAction | DestroyEntityAction | AttachComponentAction | DetachComponentAction;
