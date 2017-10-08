import { Seconds } from "../../core/models/time.model";

export type PhysicsAdvanceIntegrationAction = {
	readonly type: "PHYS_PhysicsAdvanceIntegrationAction";
	readonly deltaTime: Seconds;
}
export const PhysicsAdvanceIntegrationAction = (dt: Seconds): PhysicsAdvanceIntegrationAction => ({ type: "PHYS_PhysicsAdvanceIntegrationAction", deltaTime: dt });
