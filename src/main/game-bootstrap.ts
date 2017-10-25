import { Triangle2 } from "../pauper/core/models/triangle/triangle.model";
import { Observable } from "rxjs/Observable";
import { from } from "rxjs/observable/from";

import { Point2 } from "../pauper/core/models/point/point.model";
import { Circle, Rectangle } from "../pauper/core/models/shapes.model";
import { EntityId } from "../pauper/entity-component/entity-base.type";
import { AttachComponentAction, CreateEntityAction } from "../pauper/entity-component/entity-component.actions";
import { AppDrivers } from "../pauper/functional/app-drivers";
import { GenericAction } from "../pauper/functional/generic.action";
import { PhysicsComponent } from "./components/PhysicsComponent";
import { Range } from "immutable";
import { StaticPhysicsComponent } from "./components/StaticPhysicsComponent";

export const bootstrap: (drivers: AppDrivers) => Observable<GenericAction> = drivers => from<GenericAction>([
	...Range(0, 9).flatMap(i => Range(0, 6).map(j => Point2(i * 42 + 85, j * 72 + 95))).flatMap(createPeg).toArray(),
	...Range(0, 9).flatMap(i => Range(0, 5).map(j => Point2(i * 42 + 105, j * 72 + 130))).flatMap(createPeg).toArray(),
	...createBucket(Point2(462, 510)),
	...createBucket(Point2(412, 510)),
	...createBucket(Point2(362, 510)),
	...createBucket(Point2(312, 510)),
	...createBucket(Point2(262, 510)),
	...createBucket(Point2(212, 510)),
	...createBucket(Point2(162, 510)),
	...createBucket(Point2(112, 510)),
	...createBucket(Point2(62, 510)),
	...createRightTriangle(),
	...createLeftTriangle(),
	...createRightWall(),
	...createLeftWall(),
	...createFloor()
]);

const createPeg = (position: Point2): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticPhysicsComponent(position, Circle(0, 0, 2)))
	];
};

const createLeftTriangle = (): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticPhysicsComponent(Point2(0, 512), Triangle2(Point2(0, 0), Point2(48, 0), Point2(0, -512))))
	];
};

const createRightTriangle = (): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticPhysicsComponent(Point2(512, 512), Triangle2(Point2(0, 0), Point2(-35, 0), Point2(0, -512))))
	];
};

const createBucket = (position: Point2): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticPhysicsComponent(position, Triangle2(Point2(-25, 0), Point2(-20, -15), Point2(-15, 0))))
	];
};

const createRightWall = (): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticPhysicsComponent(Point2(0, 0), Rectangle(0, 0, -5, 512)))
	];
};

const createFloor = (): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticPhysicsComponent(Point2(0, 510), Rectangle(0, 0, 512, 2)))
	];
};

const createLeftWall = (): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticPhysicsComponent(Point2(0, 0), Rectangle(512, 0, 5, 512)))
	];
};
