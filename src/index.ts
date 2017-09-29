import "./core/extensions";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

import { add as addVector2, multiply, Vector2 } from "./core/maths/vector.maths";
import { Circle } from "./core/models/circle/circle.model";
import { Key } from "./core/models/keys.model";
import { Line2 } from "./core/models/line/line.model";
import { Point2 } from "./core/models/point/point.model";
import { Rectangle } from "./core/models/rectangle/rectangle.model";
import { Shape2 } from "./core/models/shapes.model";
import { SystemAction } from "./functional/app.actions";
import { Clear, Fill, Frame, Origin } from "./functional/frame.model";
import { _, match } from "./functional/pattern-match.function";
import { run } from "./functional/run.function";

type GameState = {
	player: {
		position: Point2;
		shape: Shape2[];
		velocity: Vector2;
	};
	bullets: {
		position: Point2;
		shape: Shape2[];
		velocity: Vector2;
		damages: "player" | "enemy"
	}[];
	enemies: {
		position: Point2;
		shape: Shape2[];
	}[];
};
type GameTick = [GameState, number];

type StartPlayerMovingLeftAction = { type: "START_MOVE_PLAYER_LEFT" };
type StopPlayerMovingLeftAction = { type: "STOP_MOVE_PLAYER_LEFT" };

type StartPlayerMovingRightAction = { type: "START_MOVE_PLAYER_RIGHT" };
type StopPlayerMovingRightAction = { type: "STOP_MOVE_PLAYER_RIGHT" };

type UpdatePlayerPosition = { type: "UPDATE_PLAYER_POSITION", deltaTime: number };
type UpdateBulletsPosition = { type: "UPDATE_BULLETS_POSITION", deltaTime: number };
type GameAction =
	StartPlayerMovingLeftAction
	| StopPlayerMovingLeftAction
	| StartPlayerMovingRightAction
	| StopPlayerMovingRightAction
	| UpdatePlayerPosition
	| UpdateBulletsPosition;
type AnyAction = SystemAction | GameAction;

function makeBullet(damages: "player" | "enemy", position: Point2, velocity: Vector2) {
	return {
		damages,
		position,
		velocity,
		shape: [Circle(0, 0, 2)]
	};
}

function makeEnemy(position: Point2) {
	return {
		position,
		shape: [
			Rectangle(-10, -10, 5, 20),
			Rectangle(-5, -3, 10, 7),
			Rectangle(5, -10, 5, 20)
		]
	};
}

const initialState: GameState = {
	player: {
		position: Point2(0, 235),
		shape: [
			Rectangle(-10, -5, 20, 5),
			Rectangle(-5, -10, 10, 5),
			Rectangle(-2, -14, 4, 4)
		],
		velocity: Vector2(0, 0)
	},
	bullets: [],
	enemies: []
};

run<GameState, AnyAction>({
	initialState,
	update: [
		tick => tick
			.map(({ state, deltaTime }) => ({ player: state.player, deltaTime }))
			.filter(({player, deltaTime}) => player.velocity.x !== 0)
			.map(({player, deltaTime}) => ({ type: "UPDATE_PLAYER_POSITION", deltaTime } as UpdatePlayerPosition)),

		tick => tick
			.map(({ state, deltaTime }) => ({ bullets: state.bullets, deltaTime }))
			.filter(({ bullets, deltaTime }) => bullets.some(bullet => bullet.velocity.y !== 0 || bullet.velocity.x !== 0 ))
			.map(({ bullets, deltaTime }) => ({ type: "UPDATE_BULLETS_POSITION", deltaTime } as UpdateBulletsPosition))
	],
	reducer: (prev: GameState, curr: AnyAction): GameState => match(curr, [
		[
			curr => curr.type === "START_MOVE_PLAYER_RIGHT",
			() => ({
				...prev,
				player: {
					...prev.player,
					velocity: {
						...prev.player.velocity,
						x: 100
					}
				}
			})
		],
		[
			curr => curr.type === "STOP_MOVE_PLAYER_RIGHT",
			() => ({
				...prev,
				player: {
					...prev.player,
					velocity: {
						...prev.player.velocity,
						x: Math.min(prev.player.velocity.x, 0)
					}
				}
			})
		],
		[
			curr => curr.type === "START_MOVE_PLAYER_LEFT",
			() => ({
				...prev,
				player: {
					...prev.player,
					velocity: {
						...prev.player.velocity,
						x: -100
					}
				}
			})
		],
		[
			curr => curr.type === "STOP_MOVE_PLAYER_LEFT",
			() => ({
				...prev,
				player: {
					...prev.player,
					velocity: {
						...prev.player.velocity,
						x: Math.max(prev.player.velocity.x, 0)
					}
				}
			})
		],
		[
			curr => curr.type === "UPDATE_PLAYER_POSITION",
			(curr: UpdatePlayerPosition) => ({
				...prev,
				player: {
					...prev.player,
					position: addVector2(prev.player.position, multiply(prev.player.velocity, curr.deltaTime))
						.pipe(vec => ({ ...vec, x: Math.max(-320, Math.min(320, vec.x)) }))
				}
			})
		],
		[
			curr => curr.type === "UPDATE_BULLETS_POSITION",
			(curr: UpdateBulletsPosition) => ({
				...prev,
				bullets: prev.bullets
					.map(bullet => ({ ...bullet, position: addVector2(bullet.position, multiply(bullet.velocity, curr.deltaTime)) }))
					.filter(bullet => bullet.position.y < 300 && bullet.position.y > -300)
			})
		],
		[_, () => prev]
	]),
	render: state => Frame(
		Clear,
		render(state)
	),
	epics: [
		actions => actions
			.filter(action => action.type === "EVENTS_KEY_DOWN" && action.key === Key.RightArrow)
			.map(() => ({ type: "START_MOVE_PLAYER_RIGHT" }) as StartPlayerMovingRightAction),
		actions => actions
			.filter(action => action.type === "EVENTS_KEY_UP" && action.key === Key.RightArrow)
			.map(() => ({ type: "STOP_MOVE_PLAYER_RIGHT" }) as StopPlayerMovingRightAction),

		actions => actions
			.filter(action => action.type === "EVENTS_KEY_DOWN" && action.key === Key.LeftArrow)
			.map(() => ({ type: "START_MOVE_PLAYER_LEFT" }) as StartPlayerMovingLeftAction),
		actions => actions
			.filter(action => action.type === "EVENTS_KEY_UP" && action.key === Key.LeftArrow)
			.map(() => ({ type: "STOP_MOVE_PLAYER_LEFT" }) as StopPlayerMovingLeftAction)
	]
});

function offsetShape(lhs: Shape2, rhs: Vector2): Shape2 {
	if (Line2.is(lhs)) {
		const line: Line2 = lhs;
		return [offsetShape(line, rhs), offsetShape(line, rhs)] as Line2;
	} else {
		return {
			...lhs,
			...addVector2(lhs, rhs)
		};
	}
}

function offsetEntity({ position, shape }: { position: Point2, shape: Shape2[] }): Shape2[] {
	return shape.map(s => offsetShape(s, position));
}

function render(state: GameState): Frame {
	return Origin(Point2(320, 240), [
		offsetEntity(state.player).map(entity => Fill(entity, "lightgreen")),
		state.enemies.mergeMap(offsetEntity).map(entity => Fill(entity, "white")),
		state.bullets
			.groupBy(bullet => bullet.damages)
			.pipe(group => [
				(group.player || []).mergeMap(offsetEntity).map(entity => Fill(entity, "lightgreen")),
				(group.enemy || []).mergeMap(offsetEntity).map(entity => Fill(entity, "white"))
			])
	]);
}
