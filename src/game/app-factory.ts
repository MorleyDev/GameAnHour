import "rxjs/add/operator/map";

import { Observable } from "rxjs/Observable";

import { Radian } from "../core/maths/angles.maths";
import { Point2 } from "../core/models/point/point.model";
import { Rectangle } from "../core/models/shapes.model";
import { SystemAction } from "../functional/app.actions";
import { Clear, Frame, Origin, Stroke } from "../functional/frame.model";
import { createReduxApp } from "../functional/redux.app";

type GameState = {
	rect1: Rectangle;
	rect2: Rectangle;
};

const initialState: GameState = {
	rect1: Rectangle(-150, 20, 50, 100),
	rect2: Rectangle(-25, -25, 50, 50)
};

const _ = Symbol();

function match<T, U, V>(target: T, patterns: [T | typeof _ | ((check: T) => boolean), (t: V) => U][]): U {
	for (let pattern of patterns) {
		const matcher = pattern[0];
		if (matcher === target || matcher === _ || (typeof matcher === "function" && matcher(target))) {
			return pattern[1](target as any as V);
		}
	}
	throw new Error("Unmatched pattern");
}

type AnyAction = SystemAction | { type: "ROTATE", angle: Radian };

const RotateAction = (angle: number): AnyAction => ({ type: "ROTATE", angle });
const RotateTick = (tick: Observable<[GameState, number]>): Observable<AnyAction> => tick.map(([_, dt]) => RotateAction(dt));

export const AppFactory = createReduxApp<GameState, AnyAction>({
	initialState,
	update: [
		RotateTick
	],
	reducer: (prev: GameState, curr: AnyAction): GameState => match(curr, [
		[
			curr => curr.type === "ROTATE",
			({ angle }: { angle: Radian }) => ({
				...prev,
				rect1: {
					...prev.rect1,
					x: prev.rect1.x * Math.cos(angle) - prev.rect1.y * Math.sin(angle),
					y: prev.rect1.x * Math.sin(angle) + prev.rect1.y * Math.cos(angle)
				},
				rect2: {
					...prev.rect2,
					x: prev.rect2.x * Math.cos(angle) - prev.rect2.y * Math.sin(angle),
					y: prev.rect2.x * Math.sin(angle) + prev.rect2.y * Math.cos(angle)
				}
			})
		],
		[_, () => prev]
	]),
	render: state => Frame(
		Clear,
		Origin(Point2(320, 240), [
			state.rect1.pipe(Stroke, "red"),
			state.rect2.pipe(Stroke, "blue"),
			state.rect1.pipe(Rectangle.lineTo, state.rect2).pipe(Stroke, "pink")
		])
	),
	epics: []
});
