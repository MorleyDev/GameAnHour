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
	...Range(0, 12).flatMap(i => Range(0, 6).map(j => Point2(i * 42 + 20, j * 72 + 95))).flatMap(createPeg).toArray(),
	...Range(0, 12).flatMap(i => Range(0, 5).map(j => Point2(i * 42 + 40, j * 72 + 130))).flatMap(createPeg).toArray(),
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
	...createLeftTriangle()
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
		AttachComponentAction(entityId, StaticPhysicsComponent(Point2(0, 512), Triangle2(Point2(0, 0), Point2(48, 0), Point2(0, -200))))
	];
};

const createRightTriangle = (): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticPhysicsComponent(Point2(512, 512), Triangle2(Point2(0, 0), Point2(-35, 0), Point2(0, -200))))
	];
};

const createBucket = (position: Point2): GenericAction[] => {
	const createBucketBase = (position: Point2): GenericAction[] => {
		const entityId = EntityId();
		return [
			CreateEntityAction(entityId),
			AttachComponentAction(entityId, StaticPhysicsComponent(position, Rectangle(-25, -2, 50, 4)))
		];
	};
	const createBucketLeftEdge = (position: Point2): GenericAction[] => {
		const entityId = EntityId();
		return [
			CreateEntityAction(entityId),
			AttachComponentAction(entityId, StaticPhysicsComponent(position, Rectangle(-25, -15, 5, 20)))
		];
	};
	const createBucketRightEdge = (position: Point2): GenericAction[] => {
		const entityId = EntityId();
		return [
			CreateEntityAction(entityId),
			AttachComponentAction(entityId, StaticPhysicsComponent(position, Rectangle(25, -15, 5, 20)))
		];
	};
	return createBucketBase(position).concat(createBucketLeftEdge(position)).concat(createBucketRightEdge(position));
};
