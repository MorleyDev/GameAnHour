import { EntityId } from "../../entity-component/entity-base.type";

export type PhysicsActiveCollisionsDelta = {
	readonly active: [EntityId, EntityId][];
	readonly inactive: [EntityId, EntityId][];
};
export const PhysicsActiveCollisionsDelta = (active: [EntityId, EntityId][], inactive: [EntityId, EntityId][]): PhysicsActiveCollisionsDelta => ({
	active,
	inactive
});
