import { Line2 } from "../core/models/line/line.model";
import { Rectangle } from "../core/models/rectangle/rectangle.model";
import { Circle } from "../core/models/circle/circle.model";
import { Point2 } from "../core/models/point/point.model";
import { Shape2 } from "../core/models/shapes.model";
import { SystemAction } from "../functional/app.actions";
import { Clear, Fill, Frame, Origin, Stroke } from "../functional/frame.model";
import { createReduxApp } from "../functional/redux.app";

type GameState = {
	shapes: {
		id: string;
		shape: Shape2;
		colour: [string, string];
	}[];
	collisionList: [string, string][]
};

const initialState: GameState = {
	shapes: [
		{
			id: "circle",
			shape: Circle(0, 0, 25),
			colour: ["yellow", "white"],
		},
		{
			id: "block",
			shape: Rectangle(-50, -50, 25, 15),
			colour: ["lightblue", "white"]
		},
		{
			id: "line",
			shape: Line2(Point2(-10, -50), Point2(25, -40)),
			colour: ["pink", "white"]
		}
	],
	collisionList: []
};

type AnyAction = SystemAction;

export const AppFactory = createReduxApp<GameState, AnyAction>({
	initialState,
	update: [
	],
	reducer: (prev: GameState, curr: AnyAction): GameState => prev,
	render: state => Frame(
		Clear,
		Origin(Point2(320, 240), state.shapes.map(shape => Stroke(shape.shape, state.collisionList.find(c => c.includes(shape.id)) != null ? shape.colour[1] : shape.colour[0])))
	),
	epics: []
});
