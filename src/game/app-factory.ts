import "rxjs/add/operator/map";

import { Observable } from "rxjs/Observable";

import { Radian } from "../core/maths/angles.maths";
import { Point2Type } from "../core/models/point/point.model.type";
import { Circle, Point2, Rectangle } from "../core/models/shapes.model";
import { SystemAction } from "../functional/app.actions";
import { Clear, Fill, Frame, Origin, Stroke } from "../functional/frame.model";
import { _, match } from "../functional/pattern-match";
import { createReduxApp } from "../functional/redux.app";

type GameState = {
	rect1: Rectangle;
	rect2: Rectangle;
	circle1: Circle;
	circle2: Circle;
};

const initialState: GameState = {
	rect1: Rectangle(-150, 20, 50, 25),
	rect2: Rectangle(-25, 105, 50, 50),
	circle1: Circle(50, 50, 15),
	circle2: Circle(-50, -50, 15)
};

type AnyAction = SystemAction | { type: "ROTATE", angle: Radian };

type RotateAction = { type: "ROTATE", angle: Radian };
const RotateAction = (angle: number): AnyAction => ({ type: "ROTATE", angle });
const RotateTick = (tick: Observable<[GameState, number]>): Observable<AnyAction> => tick.map(([_, dt]) => RotateAction(dt));

function rotate(point: Point2Type, angle: Radian): Point2Type {
	return {
		x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
		y: point.x * Math.sin(angle) + point.y * Math.cos(angle)
	};
}

export const AppFactory = createReduxApp<GameState, AnyAction>({
	initialState,
	update: [RotateTick],
	reducer: (prev: GameState, curr: AnyAction): GameState => match(curr, [
		[
			(curr): curr is RotateAction => curr.type === "ROTATE",
			({ angle }: RotateAction) => ({
				...prev,
				rect1: {
					...prev.rect1,
					...rotate(prev.rect1, angle)
				},
				rect2: {
					...prev.rect2,
					...rotate(prev.rect2, -angle)
				},
				circle1: {
					...prev.circle1,
					...rotate(prev.circle1, angle)
				},
				circle2: {
					...prev.circle2,
					...rotate(prev.circle2, angle)
				}
			})
		],
		[_, () => prev]
	]),
	render: state => Frame(
		Clear,
		Origin(Point2(320, 240), [
			state.rect1
				.pipe(Rectangle.lineTo, state.rect2)
				.pipe(Stroke, "pink"),

			state.circle1
				.pipe(Circle.lineTo, state.circle2)
				.pipe(Stroke, "pink"),

			state.circle1
				.pipe(Circle.lineTo, state.rect1)
				.pipe(Stroke, "pink"),

			state.circle1
				.pipe(Circle.lineTo, state.rect2)
				.pipe(Stroke, "pink"),

			state.rect1
				.pipe(Rectangle.lineTo, state.circle2)
				.pipe(Stroke, "pink"),

			state.rect2.pipe(Rectangle.lineTo, state.circle2)
				.pipe(Stroke, "pink"),

			state.rect1.pipe(Fill, "red"),
			state.rect2.pipe(Fill, "blue"),

			state.circle1.pipe(Fill, "green"),
			state.circle2.pipe(Fill, "yellow"),
		])
	),
	epics: []
});
