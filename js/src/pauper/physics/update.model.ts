import { Collision } from "./collision.model";

export type PhysicsUpdateResult = {
	collisionStarts: ReadonlyArray<Collision>;
	collisionEnds: ReadonlyArray<Collision>;
};
