import { from } from "rxjs/observable/from";
import { merge } from "rxjs/observable/merge";
import { fromPromise } from "rxjs/observable/fromPromise";
import { Observable } from "rxjs/Observable";
import { ignoreElements } from "rxjs/operators";

import { EntityId } from "../pauper/ecs/entity-base.type";
import { AttachComponentAction, CreateEntityAction } from "../pauper/ecs/entity-component.actions";
import { Point2 } from "../pauper/models/point/point.model";
import { Circle, Rectangle } from "../pauper/models/shapes.model";
import { Triangle2 } from "../pauper/models/triangle/triangle.model";
import { StaticBodyComponent } from "../pauper/physics/component/StaticBodyComponent";
import { AppDrivers } from "../pauper/app-drivers";
import { PegComponent } from "./components/PegComponent";
import { RenderedComponent } from "./components/RenderedComponent";
import { ScoreBucketComponent } from "./components/ScoreBucketComponent";
import { SensorPhysicsComponent } from "./components/SensorPhysicsComponent";
import { GameAction } from "./game.model";

export const bootstrap = (drivers: AppDrivers): Observable<GameAction> => {
	const Range = (start: number, amount: number): number[] => Array(amount).fill(0).map((_, i) => i + start);
	const flatMap = <T, U>(array: T[], mapper: (item: T, index: number, whole: T[]) => U[]): U[] => array.reduce((arr, item, index) => arr.concat(mapper(item, index, array) as U[]), [] as U[]);

	const createPeg = (position: Point2): GameAction[] => {
		const entityId = EntityId();
		return [
			CreateEntityAction(entityId),
			AttachComponentAction(entityId, StaticBodyComponent(position, Circle(0, 0, 3))),
			AttachComponentAction(entityId, RenderedComponent(128, 118, 100)),
			AttachComponentAction(entityId, PegComponent())
		];
	};

	const createLeftTriangle = (): GameAction[] => {
		const entityId = EntityId();
		return [
			CreateEntityAction(entityId),
			AttachComponentAction(entityId, StaticBodyComponent(Point2(0, 512), Triangle2(Point2(0, 0), Point2(48, 0), Point2(0, -512)))),
			AttachComponentAction(entityId, RenderedComponent(175, 205, 225))
		];
	};

	const createRightTriangle = (): GameAction[] => {
		const entityId = EntityId();
		return [
			CreateEntityAction(entityId),
			AttachComponentAction(entityId, StaticBodyComponent(Point2(513, 513), Triangle2(Point2(0, 0), Point2(-35, 0), Point2(0, -512)))),
			AttachComponentAction(entityId, RenderedComponent(175, 205, 225))
		];
	};

	const createBucketPoint = (position: Point2): GameAction[] => {
		const entityId = EntityId();
		return [
			CreateEntityAction(entityId),
			AttachComponentAction(entityId, StaticBodyComponent(position, Triangle2(Point2(-5, 0), Point2(5, 0), Point2(0, -30)))),
			AttachComponentAction(entityId, RenderedComponent(225, 125, 112))
		];
	};

	const createRightWall = (): GameAction[] => {
		const entityId = EntityId();
		return [
			CreateEntityAction(entityId),
			AttachComponentAction(entityId, StaticBodyComponent(Point2(0, 0), Rectangle(0, 0, -5, 512)))
		];
	};

	const createFloor = (): GameAction[] => {
		const entityId = EntityId();
		return [
			CreateEntityAction(entityId),
			AttachComponentAction(entityId, StaticBodyComponent(Point2(0, 510), Rectangle(0, 0, 512, 20))),
			AttachComponentAction(entityId, RenderedComponent(175, 205, 225))
		];
	};

	const createLeftWall = (): GameAction[] => {
		const entityId = EntityId();
		return [
			CreateEntityAction(entityId),
			AttachComponentAction(entityId, StaticBodyComponent(Point2(0, 0), Rectangle(512, 0, 5, 512)))
		];
	};

	const createScoreSensor = (position: Point2, score: number): GameAction[] => {
		const entityId = EntityId();
		return [
			CreateEntityAction(entityId),
			AttachComponentAction(entityId, SensorPhysicsComponent(position, Rectangle(-25, -30, 50, 50))),
			AttachComponentAction(entityId, ScoreBucketComponent(score))
		];
	};

		return merge(
			from<GameAction>([
			...flatMap(flatMap(Range(0, 9), i => Range(0, 6).map(j => Point2(i * 42 + 85, j * 72 + 95))), createPeg),
			...flatMap(flatMap(Range(0, 9), i => Range(0, 5).map(j => Point2(i * 42 + 105, j * 72 + 130))), createPeg),
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
		]),
		fromPromise(drivers.loader!.loadSoundEffect("boing", "./assets/boing.wav")).pipe(ignoreElements()) as Observable<GameAction>,
		fromPromise(drivers.loader!.loadImage("background", "./assets/background.png")).pipe(ignoreElements()) as Observable<GameAction>
	);
};
