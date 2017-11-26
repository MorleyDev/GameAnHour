import { BaseComponent } from "@morleydev/pauper/ecs/component-base.type";
import { EntityId } from "@morleydev/pauper/ecs/entity-base.type";
import { AttachComponentAction, CreateEntityAction } from "@morleydev/pauper/ecs/entity-component.actions";
import { Circle } from "@morleydev/pauper/models/circle/circle.model";
import { Point2 } from "@morleydev/pauper/models/point/point.model";
import { HardBodyComponent } from "@morleydev/pauper/physics/component/HardBodyComponent";
import { GameAction } from "../game.model";
import { StaticBodyComponent } from "@morleydev/pauper/physics/component/StaticBodyComponent";
import { Rectangle } from "@morleydev/pauper/models/rectangle/rectangle.model";

export type PlayerComponent = BaseComponent<"PlayerComponent", { }>;
export const PlayerComponent = (): PlayerComponent => BaseComponent("PlayerComponent", { });

export type ProjectileComponent = BaseComponent<"ProjectileComponent", { }>;
export const ProjectileComponent = (): ProjectileComponent => BaseComponent("ProjectileComponent", { });

export type EnemyComponent = BaseComponent<"EnemyComponent", { }>;
export const EnemyComponent = (): EnemyComponent => BaseComponent("EnemyComponent", { });

export const CreatePlayer = (): GameAction[] => {
	const entityId = EntityId();

	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, PlayerComponent()),
		AttachComponentAction(entityId, HardBodyComponent(Point2(-200, 0), Circle(0, 0, 10), { elasticity: 1 }))
	];
};

export const CreateTopWall = (): GameAction[] => {
	const entityId = EntityId();

	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticBodyComponent(Point2(0, -256), Rectangle(-256, -512, 512, 512)))
	];
};

export const CreateBottomWall = (): GameAction[] => {
	const entityId = EntityId();

	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticBodyComponent(Point2(0, 256), Rectangle(-256, 0, 512, 512)))
	];
};
export const CreateBackWall = (): GameAction[] => {
	const entityId = EntityId();

	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticBodyComponent(Point2(-256, 0), Rectangle(-256, -256, 256, 512)))
	];
};


export const CreateFrontWall = (): GameAction[] => {
	const entityId = EntityId();

	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticBodyComponent(Point2(256, 0), Rectangle(0, -256, 256, 512)))
	];
};
