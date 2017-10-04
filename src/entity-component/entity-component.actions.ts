import { GenericAction } from "../functional/generic.action";
import { Component } from "./component.type";
import { EntityId } from "./entity-base.type";
import { Entity } from "./entity.type";

export type CreateEntityAction = { type: "EC_CreateEntityAction", entity: Entity };
export const CreateEntityAction = (entity: Entity): CreateEntityAction => ({ type: "EC_CreateEntityAction", entity });

export type DestroyEntityAction = { type: "EC_DestroyEntityAction", id: EntityId };
export const DestroyEntityAction = (id: EntityId): DestroyEntityAction => ({ type: "EC_DestroyEntityAction", id });

export type AttachComponentAction = { type: "EC_AttachComponentAction", id: EntityId, component: Component };
export const AttachComponentAction = (id: EntityId, component: Component): AttachComponentAction => ({ type: "EC_AttachComponentAction", id, component });

export type DetachComponentAction = { type: "EC_DetachComponentAction", id: EntityId, component: string };
export const DetachComponentAction = (id: EntityId, component: string): DetachComponentAction => ({ type: "EC_DetachComponentAction", id, component });

export type EntityFilteredAction = { targetEntities: EntityId[]; };

export const EntityComponentAction = {
	CreateEntity: (action: GenericAction): action is CreateEntityAction =>  action.type === "EC_CreateEntityAction",
	DestroyEntity: (action: GenericAction): action is DestroyEntityAction =>  action.type === "EC_DestroyEntityAction",
	AttachComponent: (action: GenericAction): action is AttachComponentAction =>  action.type === "EC_AttachComponentAction",
	DetachComponent: (action: GenericAction): action is DetachComponentAction =>  action.type === "EC_DetachComponentAction"
};
export type EntityComponentAction = CreateEntityAction | DestroyEntityAction | AttachComponentAction | DetachComponentAction;
