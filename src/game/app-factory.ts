import { Circle } from "../core/models/circle/circle.model";
import { Point2 } from "../core/models/point/point.model";
import { Rectangle, Shape2 } from "../core/models/shapes.model";
import { SystemAction } from "../functional/app.actions";
import { Clear, Frame, Origin, Stroke } from "../functional/frame.model";
import { createReduxApp } from "../functional/redux.app";

type GameState = {
};

const initialState: GameState = {
};

type AnyAction = SystemAction;

export const AppFactory = createReduxApp<GameState, AnyAction>({
	initialState,
	update: [
	],
	reducer: (prev: GameState, curr: AnyAction): GameState => prev,
	render: state => Frame(
		Clear,
		Stroke(Rectangle(300, 200, 100, 100), "red"),
		Stroke(Rectangle(500, 300, 100, 100), "blue"),
		Stroke(Rectangle.lineTo(Rectangle(300, 150, 50, 100), Rectangle(500, 300, 100, 100)), "pink")
	),
	epics: []
});
