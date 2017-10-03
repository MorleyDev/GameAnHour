import { GenericAction } from "../functional/generic.action";
import { Component } from "./component.type";
import { EntityId } from "./entity-base.type";
import { Entity } from "./entity.type";

export type CreateEntityAction = { type: "EC_CREATE_ENTITY", entity: Entity };
export const CreateEntityAction = (entity: Entity): CreateEntityAction => ({ type: "EC_CREATE_ENTITY", entity });

export type DestroyEntityAction = { type: "EC_DESTROY_ENTITY", id: EntityId };
export const DestroyEntityAction = (id: EntityId): DestroyEntityAction => ({ type: "EC_DESTROY_ENTITY", id });

export type AttachComponentAction = { type: "EC_ATTACH_COMPONENT", id: EntityId, component: Component };
export const AttachComponentAction = (id: EntityId, component: Component): AttachComponentAction => ({ type: "EC_ATTACH_COMPONENT", id, component });

export type DetachComponentAction = { type: "EC_DETACH_COMPONENT", id: EntityId, component: string };
export const DetachComponentAction = (id: EntityId, component: string): DetachComponentAction => ({ type: "EC_DETACH_COMPONENT", id, component });

export const EntityComponentAction = {
	CreateEntity: (action: GenericAction): action is CreateEntityAction =>  action.type === "EC_CREATE_ENTITY",
	DestroyEntity: (action: GenericAction): action is DestroyEntityAction =>  action.type === "EC_DESTROY_ENTITY",
	AttachComponent: (action: GenericAction): action is AttachComponentAction =>  action.type === "EC_ATTACH_COMPONENT",
	DetachComponent: (action: GenericAction): action is DetachComponentAction =>  action.type === "EC_DETACH_COMPONENT"
};
export type EntityComponentAction = CreateEntityAction | DestroyEntityAction | AttachComponentAction | DetachComponentAction;
