import { EntityFilteredAction } from "../../entity-component/entity-component.actions";
import { Vector2 } from "../../core/maths/vector.maths";
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

export type ApplyForceAction = { type: "PHYS_ApplyForceAction"; force: Vector2 } & EntityFilteredAction;
export const ApplyForceAction = (force: Vector2, ...targets: EntityId[]): ApplyForceAction => ({ type: "PHYS_ApplyForceAction", targetEntities: targets, force });

export type PhysicsAction = AdvancePhysicsAction | ActiveCollisionsChangedAction;
export const PhysicsAction = {
	AdvancePhysicsAction: (action: GenericAction): action is AdvancePhysicsAction => action.type === "PHYS_AdvancePhysicsAction",
	ActiveCollisionsChangedAction: (action: GenericAction): action is ActiveCollisionsChangedAction => action.type === "PHYS_ActiveCollisionsChangedAction",
	ApplyForceAction: (action: GenericAction): action is ApplyForceAction => action.type === "PHYS_ApplyForceAction"
};
