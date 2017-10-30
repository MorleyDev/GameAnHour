import { Point2 } from "../../pauper/models/point/point.model";
import { BaseComponent } from "../../pauper/ecs/component-base.type";
import { Seconds } from "../../pauper/models/time.model";
import { Vector2 } from "../../pauper/maths/vector.maths";

export type FloatingScoreComponent = BaseComponent<"FloatingScoreComponent", {
	readonly score: number;
	readonly position: (percentage: number) => Vector2;
	readonly startingTick: Seconds;
	readonly lifespan: Seconds;
}>;

export const FloatingScoreComponent =
	(score: number, startPosition: Point2, startingTick: Seconds): FloatingScoreComponent => BaseComponent("FloatingScoreComponent", {
		score,
		position: Vector2.exponentialInterpolation(1.25)(startPosition, Vector2.add(startPosition, Vector2(0, -50))),
		startingTick,
		endPosition: Vector2.add(startPosition, Point2(0, -50)),
		lifespan: 1
	});
