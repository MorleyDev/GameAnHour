import { Vector2 } from "../../core/maths/vector.maths";
import { EntityId } from "../../entity-component/entity-base.type";

export type PhysicsApplyForceAction = {
	readonly type: "PHYS_PhysicsApplyForceAction";
	readonly target: EntityId;
	readonly force: Vector2;
};

export const PhysicsApplyForceAction = (target: EntityId, force: Vector2): PhysicsApplyForceAction => ({
	type: "PHYS_PhysicsApplyForceAction",
	target,
	force
});
