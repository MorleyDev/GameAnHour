import { Seconds } from "../../core/models/time.model";

export type AdvancePhysicsAction = { type: "PHYS_ADVANCE_PHYSICS"; deltaTime: Seconds };
export const AdvancePhysicsAction = (deltaTime: Seconds): AdvancePhysicsAction => ({ type: "PHYS_ADVANCE_PHYSICS", deltaTime });

export type PhysicsAction = AdvancePhysicsAction;
export const PhysicsAction: { AdvancePhysicsAction: "PHYS_ADVANCE_PHYSICS" } = { AdvancePhysicsAction: "PHYS_ADVANCE_PHYSICS" };
