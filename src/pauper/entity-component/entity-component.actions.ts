import { GenericAction } from "../functional/generic.action";
import { BaseComponent } from "./component-base.type";
import { BaseEntity, EntityId } from "./entity-base.type";

export type CreateEntityAction = {
	readonly type: "EC_CreateEntityAction";
	readonly id: EntityId;
};
export const CreateEntityAction = (id: EntityId): CreateEntityAction => ({ type: "EC_CreateEntityAction", id });

export type DestroyEntityAction = {
	readonly type: "EC_DestroyEntityAction";
	readonly id: EntityId;
};
export const DestroyEntityAction = (id: EntityId): DestroyEntityAction => ({ type: "EC_DestroyEntityAction", id });

export type AttachComponentAction = {
	readonly type: "EC_AttachComponentAction";
	readonly id: EntityId;
	readonly component: BaseComponent;
};
export const AttachComponentAction = <TComponent extends BaseComponent>(id: EntityId, component: TComponent): AttachComponentAction => ({ type: "EC_AttachComponentAction", id, component });

export type DetachComponentAction = {
	readonly type: "EC_DetachComponentAction";
	readonly id: EntityId;
	readonly component: string;
};
export const DetachComponentAction = (id: EntityId, component: string): DetachComponentAction => ({ type: "EC_DetachComponentAction", id, component });

export const EntityComponentAction = {
	CreateEntity: (action: GenericAction): action is CreateEntityAction =>  action.type === "EC_CreateEntityAction",
	DestroyEntity: (action: GenericAction): action is DestroyEntityAction =>  action.type === "EC_DestroyEntityAction",
	AttachComponent: (action: GenericAction): action is AttachComponentAction =>  action.type === "EC_AttachComponentAction",
	DetachComponent: (action: GenericAction): action is DetachComponentAction =>  action.type === "EC_DetachComponentAction"
};
export type EntityComponentAction = CreateEntityAction | DestroyEntityAction | AttachComponentAction | DetachComponentAction;
