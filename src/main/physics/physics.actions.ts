import { Entity } from "../../entity-component/entity.type";
import { GenericAction } from "../../functional/generic.action";
import { Seconds } from "../../core/models/time.model";
import { EntityId } from "../../entity-component/entity-base.type";

export type AdvancePhysicsAction = { type: "PHYS_AdvancePhysicsAction"; deltaTime: Seconds };
export const AdvancePhysicsAction = (deltaTime: Seconds): AdvancePhysicsAction => ({
	type: "PHYS_AdvancePhysicsAction",
	deltaTime
});

export type ActiveCollisionsChangedAction = {
	type: "PHYS_ActiveCollisionsChangedAction";
	detected: [Entity, Entity][];
	ended: [Entity, Entity][];
};
export const ActiveCollisionsChangedAction = (detected: [Entity, Entity][], ended: [Entity, Entity][]): ActiveCollisionsChangedAction => ({
	type: "PHYS_ActiveCollisionsChangedAction",
	detected,
	ended
});

export type PhysicsAction = AdvancePhysicsAction | ActiveCollisionsChangedAction;
export const PhysicsAction = {
	AdvancePhysicsAction: (action: GenericAction): action is AdvancePhysicsAction => action.type === "PHYS_AdvancePhysicsAction",
	ActiveCollisionsChangedAction: (action: GenericAction): action is ActiveCollisionsChangedAction => action.type === "PHYS_ActiveCollisionsChangedAction"
};
