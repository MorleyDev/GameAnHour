import { Range } from "immutable";
import { Observable } from "rxjs/Observable";
import { from } from "rxjs/observable/from";
import { fromPromise } from "rxjs/observable/fromPromise";
import { merge } from "rxjs/observable/merge";
import { ignoreElements } from "rxjs/operators";

import { AppDrivers } from "../pauper/app-drivers";
import { EntityId } from "../pauper/ecs/entity-base.type";
import { AttachComponentAction, CreateEntityAction } from "../pauper/ecs/entity-component.actions";
import { Point2 } from "../pauper/models/point/point.model";
import { Circle, Rectangle } from "../pauper/models/shapes.model";
import { Triangle2 } from "../pauper/models/triangle/triangle.model";
import { StaticBodyComponent } from "../pauper/physics/component/StaticBodyComponent";
import { GenericAction } from "../pauper/redux/generic.action";
import { PegComponent } from "./components/PegComponent";
import { RenderedComponent } from "./components/RenderedComponent";
import { ScoreBucketComponent } from "./components/ScoreBucketComponent";
import { SensorPhysicsComponent } from "./components/SensorPhysicsComponent";
import { GameAction } from "./game.model";

export const bootstrap: (drivers: AppDrivers) => Observable<GameAction> = drivers => merge<GameAction>(
	fromPromise(drivers.loader!.loadSoundEffect("boing", "./assets/boing.wav")).pipe(ignoreElements()),
	from([
		...Range(0, 9).flatMap(i => Range(0, 6).map(j => Point2(i * 42 + 85, j * 72 + 95))).flatMap(createPeg).toArray(),
		...Range(0, 9).flatMap(i => Range(0, 5).map(j => Point2(i * 42 + 105, j * 72 + 130))).flatMap(createPeg).toArray(),
		...createBucketPoint(Point2(412, 512)),
		...createBucketPoint(Point2(362, 512)),
		...createBucketPoint(Point2(312, 512)),
		...createBucketPoint(Point2(262, 512)),
		...createBucketPoint(Point2(212, 512)),
		...createBucketPoint(Point2(162, 512)),
		...createBucketPoint(Point2(112, 512)),
		...createScoreSensor(Point2(138, 510), 10),
		...createScoreSensor(Point2(187, 510), 6),
		...createScoreSensor(Point2(237, 510), 3),
		...createScoreSensor(Point2(287, 510), 3),
		...createScoreSensor(Point2(338, 510), 6),
		...createScoreSensor(Point2(385, 510), 10),
		...createRightTriangle(),
		...createLeftTriangle(),
		...createRightWall(),
		...createLeftWall(),
		...createFloor()
	])
);

const createPeg = (position: Point2): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticBodyComponent(position, Circle(0, 0, 3))),
		AttachComponentAction(entityId, RenderedComponent(128, 118, 100)),
		AttachComponentAction(entityId, PegComponent())
	];
};

const createLeftTriangle = (): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticBodyComponent(Point2(0, 512), Triangle2(Point2(0, 0), Point2(48, 0), Point2(0, -512)))),
		AttachComponentAction(entityId, RenderedComponent(175, 205, 225))
	];
};

const createRightTriangle = (): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticBodyComponent(Point2(513, 513), Triangle2(Point2(0, 0), Point2(-35, 0), Point2(0, -512)))),
		AttachComponentAction(entityId, RenderedComponent(175, 205, 225))
	];
};

const createBucketPoint = (position: Point2): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticBodyComponent(position, Triangle2(Point2(-5, 0), Point2(5, 0), Point2(0, -30)))),
		AttachComponentAction(entityId, RenderedComponent(225, 125, 112))
	];
};

const createRightWall = (): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticBodyComponent(Point2(0, 0), Rectangle(0, 0, -5, 512)))
	];
};

const createFloor = (): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticBodyComponent(Point2(0, 510), Rectangle(0, 0, 512, 20))),
		AttachComponentAction(entityId, RenderedComponent(175, 205, 225))
	];
};

const createLeftWall = (): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, StaticBodyComponent(Point2(0, 0), Rectangle(512, 0, 5, 512)))
	];
};

const createScoreSensor = (position: Point2, score: number): GenericAction[] => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, SensorPhysicsComponent(position, Rectangle(-25, -30, 50, 50))),
		AttachComponentAction(entityId, ScoreBucketComponent(score))
	];
};
