import { Circle } from "./core/models/circle.model";
import { Vector2 } from "./core/maths/vector.maths";
import "rxjs/add/operator/do";
import "rxjs/add/operator/filter";

import { main } from "./core/main";
import { Key } from "./core/models/keys.model";
import { Point2 } from "./core/models/point.model";
import { Rectangle } from "./core/models/rectangle.model";
import { SystemAction, KeyDown, KeyUp } from "./functional/app.actions";
import { Frame } from "./functional/frame.model";
import { createReduxApp } from "./functional/redux.app";
import { Set, List } from "immutable";
import { Text2 } from "./core/models/text.model";

type Entity = {
	readonly id: string;
	readonly position: Point2;
	readonly size: Point2;
	readonly velocity: Point2;
	readonly controller: "Ball" | "Player";
};

type GameState = {
	readonly entities: List<Entity>;
	readonly score: number;
};

type AnyAction = SystemAction | BallCollisionAction | UpdatePhysicsAction | PaddleBallCollisionAction | BallWallCollisionAction;

type BallCollisionAction = { type: "BallCollision" };
const BallCollisionAction = "BallCollision";

type UpdatePhysicsAction = { type: "UpdatePhysics"; deltaTimeS: number };
const UpdatePhysicsAction = "UpdatePhysics";

type PaddleBallCollisionAction = { type: "PaddleBallCollision", ball: Entity };
const PaddleBallCollisionAction = "PaddleBallCollision";

type BallWallCollisionAction = { type: "BallWallCollisionAction", direction: CardinalDirection };
const BallWallCollisionAction = "BallWallCollisionAction";
enum CardinalDirection { Right, Left, Up, Down };

const AppFactory = createReduxApp<GameState, AnyAction>({
	initialState: {
		entities: List<Entity>().push(
			{
				id: "ball1",
				position: Point2(0, -200),
				size: Point2(15, 15),
				velocity: Point2(151, 151),
				controller: "Ball"
			},
			{
				id: "paddle",
				position: Point2(0, 200),
				size: Point2(60, 10),
				velocity: Point2(0, 0),
				controller: "Player"
			}
		),
		score: 0
	},
	update: (state, deltaTimeS) => {
		const paddle = state.entities.find(f => f.id == "paddle")!;
		const ball = state.entities.find(f => f.id == "ball1")!;
		const arePaddleAndBallColliding = !!(paddle && ball && ball.velocity.y > 0 && !((ball.position.x > paddle.position.x + paddle.size.x || ball.position.x + ball.size.x < paddle.position.x) || (ball.position.y > paddle.position.y + paddle.size.y || ball.position.y + ball.size.y < paddle.position.y + paddle.size.y / 2)));

		const connection: AnyAction[] = [];
		if (arePaddleAndBallColliding) connection.push({ type: PaddleBallCollisionAction, ball });
		
		if (ball.position.x <= -320) connection.push({
			type: BallWallCollisionAction,
			direction: CardinalDirection.Left
		});
		else if (ball.position.x + ball.size.x >= 320) connection.push({
			type: BallWallCollisionAction,
			direction: CardinalDirection.Right
		});

		if (ball.position.y <= -240) connection.push({
			type: BallWallCollisionAction,
			direction: CardinalDirection.Up
		});
		else if (ball.position.y + ball.size.y >= 240) connection.push({
			type: BallWallCollisionAction,
			direction: CardinalDirection.Down
		});
		
		connection.push({ type: UpdatePhysicsAction, deltaTimeS })
		return connection;
	},
	reducer: (prev: GameState, curr: AnyAction): GameState => {
		switch (curr.type) {
			case UpdatePhysicsAction:
				return UpdatePhysics(prev, curr);
			case KeyDown:
				return KeyDownGameState(prev, curr);
			case KeyUp:
				return KeyUpGameState(prev, curr);
			case PaddleBallCollisionAction:
				return PaddleBallCollision(prev, curr);
			case BallWallCollisionAction:
				return WallCollision(prev, curr);
			default:
				return prev;
		}
	}, render: state => [
		["clear"],
		["stroke", Text2(state.score.toString(), 15, 15, undefined, "30px"), "white"],
		["origin", Point2(320, 240), state.entities.map(DrawEntity).reduce((prev, curr) => prev.concat(curr), [] as Frame)]
	],
	epics: []
});
main(AppFactory);

function DrawEntity(entity: Entity): Frame {
	return [
		["fill", entity.controller == "Player"
			? Rectangle(entity.position.x, entity.position.y, entity.size.x, entity.size.y)
			: Circle(entity.position.x + entity.size.x / 4, entity.position.y + entity.size.y / 4, entity.size.x / 2)
			, "green"]
	];
}

function UpdatePhysics(state: GameState, { deltaTimeS }: UpdatePhysicsAction): GameState {
	return {
		...state,
		entities: state.entities.map(entity => ({
			...entity,
			position: {
				x: Math.min(320 - entity.size.x, Math.max(-320, entity.position.x + entity.velocity.x * deltaTimeS)),
				y: Math.min(240 - entity.size.y, Math.max(-240, entity.position.y + entity.velocity.y * deltaTimeS))
			}
		}))
	};
}

function WallCollision(state: GameState, { direction }: BallWallCollisionAction): GameState {
	return {
		...state,
		entities: state.entities.map(entity => entity.id !== "ball1" ? entity : (({
			[CardinalDirection.Up]: (entity: Entity) => ({ ...entity, velocity: { ...entity.velocity, y: -Math.min(-50, entity.velocity.y) } }),
			[CardinalDirection.Down]: (entity: Entity) =>  ({ ...entity, position: { ...entity.position, y: -140 }, velocity: { ...entity.velocity, y: -Math.max(50, entity.velocity.y) } }),
			[CardinalDirection.Left]: (entity: Entity) => ({ ...entity, velocity: { ...entity.velocity, x: -Math.min(-50, entity.velocity.x) } }),
			[CardinalDirection.Right]: (entity: Entity) => ({ ...entity, velocity: { ...entity.velocity, x: -Math.max(50, entity.velocity.x) } })
		})[direction] || ((entity: Entity) => entity))(entity))
	}
}

function PaddleBallCollision(state: GameState, { ball }: PaddleBallCollisionAction): GameState {
	return {
		...state,
		score: state.score + 1,
		entities: state.entities.map(e => (({
			[ball.id]: (ball: Entity) => ({
				...ball,
				velocity: {
					x: ball.velocity.x,
					y: -Math.abs(ball.velocity.y)
				}
			})
		}[e.id] || (e => e))(e))),
	};
}

function KeyDownGameState(state: GameState, { key }: KeyDown): GameState {
	switch (key) {
		case Key.LeftArrow:
			return {
				...state,
				entities: state.entities.map(entity => entity.controller == "Player" ? {
					...entity,
					velocity: {
						...entity.velocity,
						x: -150
					}
				} : entity)
			};
		case Key.RightArrow:
			return {
				...state,
				entities: state.entities.map(entity => entity.controller == "Player" ? {
					...entity,
					velocity: {
						...entity.velocity,
						x: 150
					}
				} : entity)
			};
		default:
			return state;
	}
}

function KeyUpGameState(state: GameState, { key }: KeyUp): GameState {
	switch (key) {
		case Key.LeftArrow:
			return {
				...state,
				entities: state.entities.map(entity => entity.controller == "Player" ? {
					...entity,
					velocity: {
						...entity.velocity,
						x: Math.max(0, entity.velocity.x)
					}
				} : entity)
			};
		case Key.RightArrow:
			return {
				...state,
				entities: state.entities.map(entity => entity.controller == "Player" ? {
					...entity,
					velocity: {
						...entity.velocity,
						x: Math.min(0, entity.velocity.x)
					}
				} : entity)
			};
		default:
			return state;
	}
}