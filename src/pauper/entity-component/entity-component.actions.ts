import { GenericAction } from "../functional/generic.action";
import { BaseComponent } from "./component-base.type";
import { BaseEntity, EntityId } from "./entity-base.type";

export type CreateEntityAction = { type: "EC_CreateEntityAction", entity: BaseEntity };
export const CreateEntityAction = (entity: BaseEntity): CreateEntityAction => ({ type: "EC_CreateEntityAction", entity });

export type DestroyEntityAction = { type: "EC_DestroyEntityAction", id: EntityId };
export const DestroyEntityAction = (id: EntityId): DestroyEntityAction => ({ type: "EC_DestroyEntityAction", id });

export type AttachComponentAction = { type: "EC_AttachComponentAction", id: EntityId, component: BaseComponent };
export const AttachComponentAction = (id: EntityId, component: BaseComponent): AttachComponentAction => ({ type: "EC_AttachComponentAction", id, component });

export type DetachComponentAction = { type: "EC_DetachComponentAction", id: EntityId, component: string };
export const DetachComponentAction = (id: EntityId, component: string): DetachComponentAction => ({ type: "EC_DetachComponentAction", id, component });

export const EntityComponentAction = {
	CreateEntity: (action: GenericAction): action is CreateEntityAction =>  action.type === "EC_CreateEntityAction",
	DestroyEntity: (action: GenericAction): action is DestroyEntityAction =>  action.type === "EC_DestroyEntityAction",
	AttachComponent: (action: GenericAction): action is AttachComponentAction =>  action.type === "EC_AttachComponentAction",
	DetachComponent: (action: GenericAction): action is DetachComponentAction =>  action.type === "EC_DetachComponentAction"
};
export type EntityComponentAction = CreateEntityAction | DestroyEntityAction | AttachComponentAction | DetachComponentAction;
