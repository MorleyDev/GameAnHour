import { Circle } from "../core/models/circle/circle.model";
import { Point2 } from "../core/models/point/point.model";
import { Rectangle } from "../core/models/rectangle/rectangle.model";
import { Shape2 } from "../core/models/shapes.model";
import { SystemAction } from "../functional/app.actions";
import { Clear, Frame, Origin, Stroke } from "../functional/frame.model";
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
			shape: Circle(5, 10, 25),
			colour: ["yellow", "white"],
		},
		{
			id: "block1",
			shape: Rectangle(-50, -50, 25, 15),
			colour: ["lightblue", "white"]
		},
		{
			id: "block2",
			shape: Rectangle(50, 50, 250, 150),
			colour: ["lightblue", "white"]
		},
		{
			id: "circle",
			shape: Circle(-25, -35, 5),
			colour: ["pink", "white"]
		},
		{
			id: "circle",
			shape: Circle(230, -25, 10),
			colour: ["pink", "white"]
		},
		{
			id: "circle",
			shape: Circle(0, 125, 10),
			colour: ["pink", "white"]
		},
		{
			id: "circle",
			shape: Circle(0, -30, 10),
			colour: ["pink", "white"]
		},
		{
			id: "circle2rect",
			shape: Rectangle.lineTo(Rectangle(-50, -50, 25, 15), Circle(0, -30, 10)),
			colour: ["pink", "white"]
		},
		{
			id: "line2circle",
			shape: Circle.lineTo(Circle(5, 10, 25), Circle(-25, -35, 5)),
			colour: ["pink", "white"]
		},
		{
			id: "line2rect",
			shape: Rectangle.lineTo(Rectangle(50, 50, 250, 150), Point2(130, -25)),
			colour: ["pink", "white"]
		},
		{
			id: "circle2rect",
			shape: Rectangle.lineTo(Rectangle(50, 50, 250, 150), Circle(230, -25, 10)),
			colour: ["pink", "white"]
		},
		{
			id: "circle2rect",
			shape: Rectangle.lineTo(Rectangle(50, 50, 250, 150), Circle(0, 125, 10)),
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
		Origin(
			Point2(320, 240),
			state.shapes.map(shape => Stroke(
				shape.shape,
				state.collisionList.find(c => c.includes(shape.id)) != null
					? shape.colour[1]
					: shape.colour[0])
			)
		),
	),
	epics: []
});
