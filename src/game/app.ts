import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/observable/merge";

import { Vector2 } from "../core/maths/vector.maths";
import { Circle } from "../core/models/circle.model";
import { Point2 } from "../core/models/point.model";
import { Rectangle } from "../core/models/rectangle.model";
import { SystemAction } from "../functional/app.actions";
import { Clear, Fill, Frame, FrameCommand, Origin } from "../functional/frame.model";
import { createReduxApp } from "../functional/redux.app";
import { Key } from "../core/models/keys.model";
import { Observable } from "rxjs/Observable";

type GameState = {
	ball: {
		shape: Circle;
		position: Point2;
		velocity: Vector2;
	};
	paddle: {
		shape: Rectangle;
		position: Point2;
		velocity: Vector2;
	};
	bricks: {
		shape: Rectangle;
		position: Point2;
		id: string;
	}[];
};

const initialState: GameState = {
	ball: {
		shape: Circle(0, 0, 10),
		position: Point2(0, 180),
		velocity: Vector2(0, 0)
	},
	paddle: {
		shape: Rectangle(-40, -5, 80, 10),
		position: Point2(0, 200),
		velocity: Vector2(0, 0)
	},
	
	bricks: Array(10).fill(0).map((_, i) => Array(5).fill(0).map((_, j) => Point2(i * 60 - 320 + 45, j * 35 - 240 + 30))).reduce((p, c) => p.concat(c), [])
		.map((position, index) => ({
			shape: Rectangle(-20, -10,  50, 10),
			position: position,
			id: index.toString()
		}))
};

type UpdatePhysicsAction = { type: "UPDATE_PHYSICS", deltaTimeS: number; };
const UpdatePhysicsAction = (deltaTimeS: number): UpdatePhysicsAction => ({ type: "UPDATE_PHYSICS", deltaTimeS });

const UpdatePhysics = (state: GameState, action: UpdatePhysicsAction): GameState => ({
	...state,
	ball: {
		...state.ball,
		position: {
			x: state.ball.position.x + state.ball.velocity.x * action.deltaTimeS,
			y: state.ball.position.y + state.ball.velocity.y * action.deltaTimeS
		},
	},
	paddle: {
		...state.paddle,
		position: {
			x: Math.max(-280, Math.min(280, state.paddle.position.x + state.paddle.velocity.x * action.deltaTimeS)),
			y: state.paddle.position.y + state.paddle.velocity.y * action.deltaTimeS
		}
	}
});

type StartPaddleMoveAction = { type: "START_MOVE_LEFT_ACTION" | "START_MOVE_RIGHT_ACTION" };
type StopPaddleMoveAction = { type: "STOP_MOVE_LEFT_ACTION" | "STOP_MOVE_RIGHT_ACTION" };
type StartBallMovingAction = { type: "START_BALL_MOVING_ACTION" };
type BallCollideAction = {
	type: "BALL_COLLIDE_LEFT" | "BALL_COLLIDE_RIGHT" | "BALL_COLLIDE_UP" | "BALL_COLLIDE_DOWN",
	target: "paddle" | "wall" | string
};
type DestroyBrickAction = {
	type: "DESTROY_BRICK";
	target: string;
};

type GameAction = UpdatePhysicsAction
	| StartPaddleMoveAction
	| StopPaddleMoveAction
	| StartBallMovingAction
	| BallCollideAction
	| DestroyBrickAction;
	
type AnyAction = SystemAction | GameAction;

const ReducerSet: {
	[index: string]: ((prev: GameState, curr: AnyAction) => GameState) | undefined;
	default: (prev: GameState, curr: AnyAction) => GameState;
} = {
	["UPDATE_PHYSICS"]: UpdatePhysics,
	["START_MOVE_LEFT_ACTION"]: (state, _) => ({ ...state, paddle: { ...state.paddle, velocity: { x: -200, y: 0 }} }),
	["START_MOVE_RIGHT_ACTION"]: (state, _) => ({ ...state, paddle: { ...state.paddle, velocity: { x: 200, y: 0 }} }),
	["STOP_MOVE_LEFT_ACTION"]: (state, _) => ({ ...state, paddle: { ...state.paddle, velocity: { x: Math.max(state.paddle.velocity.x, 0), y: 0 }} }),
	["STOP_MOVE_RIGHT_ACTION"]: (state, _) => ({ ...state, paddle: { ...state.paddle, velocity: { x: Math.min(state.paddle.velocity.x, 0), y: 0 }} }),
	["START_BALL_MOVING_ACTION"]:(state, _) => (state.ball.velocity.x !== 0 || state.ball.velocity.y !== 0 ? state : { ...state, ball: { ...state.ball, velocity: { x: -100, y: -100 } } }),

	["BALL_COLLIDE_LEFT"]: (state, action: BallCollideAction) => ({
		...state,
		ball: { 
			...state.ball, velocity: {
				...state.ball.velocity,
				x: Math.abs(state.ball.velocity.x)
			}
		}
	}),
	["BALL_COLLIDE_RIGHT"]: (state, action: BallCollideAction) => ({
		...state, ball: {
			...state.ball,
			velocity: {
				...state.ball.velocity,
				x: -Math.abs(state.ball.velocity.x)
			}
		}
	}),
	["BALL_COLLIDE_UP"]: (state, action: BallCollideAction) => ({
		...state,
		ball: {
			...state.ball,
			velocity: {
				...state.ball.velocity,
				y: Math.abs(state.ball.velocity.y)
			}
		}
	}),
	["BALL_COLLIDE_DOWN"]: (state, action: BallCollideAction) => (action.target === "wall" ? initialState : {
		...state,
		ball: {
			...state.ball,
			velocity: {
				...state.ball.velocity,
				y: -Math.abs(state.ball.velocity.y)
			}
		}
	}),
	["DESTROY_BRICK"]: (state, action: DestroyBrickAction) => ({
		...state,
		bricks: state.bricks.filter(b => b.id !== action.target)
	}),
	default: (prev: GameState, curr: AnyAction): GameState => prev
};

export const AppFactory = createReduxApp<GameState, AnyAction>({
	initialState,
	update: [
		tick => tick.mergeMap(([state, deltaTimeS]) => DetectWallCollisions(state.ball)),
		tick => tick.mergeMap(([state, deltaTimeS]) => DetectPaddleCollisions(state.paddle, state.ball)),
		tick => tick.mergeMap(([state, deltaTimeS]) => DetectBlockCollisions(state.bricks, state.ball)),
		tick => tick.map(([state, deltaTimeS]) => UpdatePhysicsAction(deltaTimeS))
	],
	reducer: (prev: GameState, curr: AnyAction): GameState => (ReducerSet[curr.type] || ReducerSet.default)(prev, curr),
	render: state => Frame(
		Clear,
		Origin(Point2(320, 240), [
			Draw(state.ball, "grey"),
			Draw(state.paddle, "white"),
			state.bricks.map(brick => Draw(brick, "red"))
		])
	),
	epics: [
		action => action
			.filter(a => a.type === "EVENTS_KEY_DOWN" && a.key === Key.LeftArrow)
			.map(_ => ({ type: "START_MOVE_LEFT_ACTION" } as AnyAction)),

		action => action
			.filter(a => a.type === "EVENTS_KEY_UP" && a.key === Key.LeftArrow)
			.map(_ => ({ type: "STOP_MOVE_LEFT_ACTION" } as AnyAction)),

	action => action
			.filter(a => a.type === "EVENTS_KEY_UP" && a.key === Key.Space)
			.map(_ => ({ type: "START_BALL_MOVING_ACTION" } as AnyAction)),

		action => action
			.filter(a => a.type === "EVENTS_KEY_DOWN" && a.key === Key.RightArrow)
			.map(_ => ({ type: "START_MOVE_RIGHT_ACTION" } as AnyAction)),

		action => action
			.filter(a => a.type === "EVENTS_KEY_UP" && a.key === Key.RightArrow)
			.map(_ => ({ type: "STOP_MOVE_RIGHT_ACTION" } as AnyAction))
		]
});

function DetectWallCollisions({ shape, position }: { shape: Circle; position: Point2 }): AnyAction[] {
	const topLeft = Point2(shape.x + position.x - shape.radius, shape.y + position.y - shape.radius);
	const bottomRight = Point2(shape.x + position.x + shape.radius, shape.y + position.y + shape.radius);
	if (topLeft.x < -320) {
		return [{ type: "BALL_COLLIDE_LEFT", target: "wall" }];
	}
	if (topLeft.y < -240) {
		return [{ type: "BALL_COLLIDE_UP", target: "wall" }];
	}
	if (bottomRight.x > 320) {
		return [{ type: "BALL_COLLIDE_RIGHT", target: "wall" }];
	}
	if (bottomRight.y > 240) {
		return [{ type: "BALL_COLLIDE_DOWN", target: "wall" }];
	}
	return [];
}

function DetectPaddleCollisions(paddle: { shape: Rectangle; position: Point2 }, ball: { shape: Circle; position: Point2 }): AnyAction[] {
	const paddleCollisionMap = getCollisionMap(paddle);
	const ballCollisionMap = Circle.boundingBox( getAbsolute(ball.position, ball.shape) as Circle );

	return getCollisionActions(paddleCollisionMap, ballCollisionMap);
}

function getCollisionActions(b: { map: Rectangle; type: string; target: string }[], a: Rectangle): BallCollideAction[] {
	return b
		.filter(cm => Rectangle.overlaps(cm.map, a))
		.map(cm => ({ type: cm.type, target: cm.target } as BallCollideAction));
}

function DetectBlockCollisions(blocks: { shape: Rectangle; position: Point2; id: string; }[], ball: { shape: Circle; position: Point2 }): AnyAction[] {
	const ballCollisionMap = Circle.boundingBox( getAbsolute(ball.position, ball.shape) as Circle );

	return blocks
		.map(block =>getCollisionMap(block))
		.map(block => getCollisionActions(block, ballCollisionMap))
		.reduce((prev, curr) => prev.concat(curr), [])
		.map(action => [action as AnyAction, { type: "DESTROY_BRICK", target: action.target } ] as AnyAction[])
		.reduce((prev, curr) => prev.concat(curr), []);
}

function getCollisionMap({ position, shape, id }: { shape: Rectangle; position: Point2, id?: string }) {
	const corners = Rectangle.boundingTLBR(getAbsolute(position, shape) as Rectangle);

	return [
		{ map: Rectangle(corners.topLeft.x, corners.topLeft.y, 5, shape.height), type: "BALL_COLLIDE_LEFT", target: id || "paddle" },
		{ map: Rectangle(corners.topLeft.x, corners.topLeft.y, shape.width, shape.height / 3), type: "BALL_COLLIDE_DOWN", target: id || "paddle" },
		{ map: Rectangle(corners.bottomRight.x - 5, corners.topLeft.y, 5, shape.height), type: "BALL_COLLIDE_RIGHT", target: id || "paddle" },
		{ map: Rectangle(corners.topLeft.x, corners.bottomRight.y - (shape.height / 3), shape.width, shape.height / 3), type: "BALL_COLLIDE_UP", target: id || "paddle" }
	];
}

function getAbsolute(position: Point2, shape: Circle | Rectangle): typeof shape {
	return {
		...shape,
		x: shape.x + position.x,
		y: shape.y + position.y
	};
}

function Draw(obj: { position: Point2; shape: Circle | Rectangle; }, colour: string) {
	return Fill(getAbsolute(obj.position, obj.shape), colour);
}
