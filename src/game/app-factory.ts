import { Circle } from "../core/models/circle/circle.model";
import { Point2 } from "../core/models/point/point.model";
import { Line2 } from "../core/models/shapes.model";
import { SystemAction } from "../functional/app.actions";
import { Clear, Frame, Origin, Stroke } from "../functional/frame.model";
import { createReduxApp } from "../functional/redux.app";

type GameState = { };

const initialState: GameState = { };

type AnyAction = SystemAction;

export const AppFactory = createReduxApp<GameState, AnyAction>({
	initialState,
	update: [],
	reducer: (prev: GameState, curr: AnyAction): GameState => prev,
	render: state => Frame(
		Clear,
		Origin(Point2(320, 240), [
			Stroke(Line2(Point2(10, 20), Point2(50, 100)), "red"),
			Stroke(Circle(0, 0, 25), "green"),
			Stroke(Line2(Point2(-10, -20), Point2(50, -100)), "blue")
		])
	),
	epics: []
});
