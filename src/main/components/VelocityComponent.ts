import { Vector2 } from "../../pauper/core/maths/vector.maths";

export type VelocityComponent = { name: "VelocityComponent"; velocity: Vector2; };
export const VelocityComponent: "VelocityComponent" = "VelocityComponent";

export const CreateVelocityComponent = (velocity: Vector2): VelocityComponent => ({ name: VelocityComponent, velocity });
