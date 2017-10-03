import { GenericAction } from "../../functional/generic.action";
import { Seconds } from "../../core/models/time.model";
import { EntityId } from "../../entity-component/entity-base.type";

export type AdvancePhysicsAction = { type: "PHYS_ADVANCE_PHYSICS"; deltaTime: Seconds };
export const AdvancePhysicsAction = (deltaTime: Seconds): AdvancePhysicsAction => ({
	type: "PHYS_ADVANCE_PHYSICS",
	deltaTime
});

export type CollisionDetectedAction = {
	type: "PHYS_COLLISION_DETECTED";
	ids: [EntityId, EntityId];
};
export const CollisionDetectedAction = (lhs: EntityId, rhs: EntityId): CollisionDetectedAction => ({
	type: "PHYS_COLLISION_DETECTED",
	ids: [lhs, rhs]
});

export type PhysicsAction = AdvancePhysicsAction | CollisionDetectedAction;
export const PhysicsAction = {
	AdvancePhysicsAction: (action: GenericAction): action is AdvancePhysicsAction => action.type === "PHYS_ADVANCE_PHYSICS",
	CollisionDetectedAction: (action: GenericAction): action is CollisionDetectedAction => action.type === "PHYS_COLLISION_DETECTED"
};
