import { EntityId } from "../../entity-component/entity-base.type";

export type PhysicsChangeActiveCollisionsAction = {
	readonly type: "PHYS_PhysicsChangeActiveCollisionsAction";
	readonly active: [EntityId, EntityId][];
	readonly inactive: [EntityId, EntityId][];
};
export const PhysicsChangeActiveCollisionsAction = (active: [EntityId, EntityId][], inactive: [EntityId, EntityId][]): PhysicsChangeActiveCollisionsAction => ({
	type: "PHYS_PhysicsChangeActiveCollisionsAction",
	active,
	inactive
});
