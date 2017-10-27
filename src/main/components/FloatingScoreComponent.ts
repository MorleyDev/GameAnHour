import { Point2 } from "../../pauper/core/models/point/point.model";
import { BaseComponent } from "../../pauper/entity-component/component-base.type";
import { Seconds } from "../../pauper/core/models/time.model";
import { Vector2 } from "../../pauper/core/maths/vector.maths";

export type FloatingScoreComponent = BaseComponent<"FloatingScoreComponent", {
	readonly score: number;
	readonly startPosition: Point2;
	readonly endPosition: Point2;
	readonly startingTick: Seconds;
	readonly lifespan: Seconds;
}>;

export const FloatingScoreComponent =
	(score: number, startPosition: Point2, startingTick: Seconds): FloatingScoreComponent => BaseComponent("FloatingScoreComponent", {
		score,
		startPosition,
		startingTick,
		endPosition: Vector2.add(startPosition, Point2(0, -50)),
		lifespan: 1
	});
