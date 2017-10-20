import { Observable } from "rxjs/Observable";
import { concat } from "rxjs/observable/concat";
import { fromEvent } from "rxjs/observable/fromEvent";
import { interval } from "rxjs/observable/interval";
import { merge } from "rxjs/observable/merge";
import { of } from "rxjs/observable/of";
import { filter, map, mergeMap } from "rxjs/operators";

import { Vector2 } from "../pauper/core/maths/vector.maths";
import { CardinalDirection } from "../pauper/core/models/direction.model";
import { Key } from "../pauper/core/models/keys.model";
import { Line2 } from "../pauper/core/models/line/line.model";
import { Rectangle } from "../pauper/core/models/rectangle/rectangle.model";
import { Point2, Shape2 } from "../pauper/core/models/shapes.model";
import { Seconds } from "../pauper/core/models/time.model";
import { createEntitiesStateMap, entityComponentReducer } from "../pauper/entity-component";
import { createEntityReducer } from "../pauper/entity-component/create-entity-reducer.func";
import { EntityId } from "../pauper/entity-component/entity-base.type";
import { destroyEntity } from "../pauper/entity-component/entity-component.reducer";
import { createReducer } from "../pauper/functional/create-reducer.func";
import { Clear, Fill, Origin } from "../pauper/functional/render-frame.model";
import { _, patternMatch } from "../pauper/functional/utility-pattern-match.function";
import { PositionComponent } from "./components/PositionComponent";
import { RenderComponent } from "./components/RenderComponent";
import { ShapeComponent } from "./components/ShapeComponent";
import { VelocityComponent } from "./components/VelocityComponent";
import { bootstrap } from "./game-bootstrap";
import { initialState } from "./game-initial-state";
import { GameAction, GameState, GameStateFlag } from "./game.model";

const PaddleSpeed = 250;
const InitialBallSpeed = 200;

const requestStartGameEntityReducer = createEntityReducer(
	[VelocityComponent, "Ball"],
	((state, action, velocity: VelocityComponent, ball: any) => [
		{
			...velocity,
			velocity: Vector2.multiply(Vector2.invert(Vector2.normal(Vector2.Unit)), InitialBallSpeed)
		},
		ball
	])
);

const startPlayerMove = (cardinal: CardinalDirection.Left | CardinalDirection.Right) => createEntityReducer(
	[VelocityComponent, "Paddle"],
	(state, action, velocity: VelocityComponent, paddle: any) => [
		{
			...velocity,
			velocity: Vector2(cardinal === CardinalDirection.Left ? -PaddleSpeed : PaddleSpeed, 0)
		},
		paddle
	]
);
const stopPlayerMove = (cardinal: CardinalDirection.Left | CardinalDirection.Right) => createEntityReducer(
	[VelocityComponent, "Paddle"],
	(state, action, velocity: VelocityComponent, paddle: any) => [
		{
			...velocity,
			velocity: Vector2(cardinal === CardinalDirection.Left ? Math.max(velocity.velocity.x, 0) : Math.min(velocity.velocity.x, 0), 0)
		},
		paddle
	]
);

const velocityPositionTickReducer = createEntityReducer(
	[VelocityComponent, PositionComponent],
	(state: GameState, action: { readonly type: "@@TICK"; readonly deltaTime: Seconds }, velocity: VelocityComponent, position: PositionComponent) => [
		velocity,
		{
			name: PositionComponent,
			position: Vector2.add(position.position, Vector2.multiply(velocity.velocity, action.deltaTime))
		}
	]
);

function bounceBall(ballId: EntityId, state: GameState, direction: CardinalDirection | null): GameState {
	if (direction == null) {
		return state;
	}
	return {
		...state,
		entities: state.entities.update(ballId, entity => ({
			...entity,
			components: entity.components.update(VelocityComponent, (component: VelocityComponent) => ({
				...component,
				velocity: Vector2(
					patternMatch(direction,
						[CardinalDirection.Left, () => -Math.abs(component.velocity.x)],
						[CardinalDirection.Right, () => Math.abs(component.velocity.x)],
						[_, () => component.velocity.x]
					),
					patternMatch(direction,
						[CardinalDirection.Up, () => -Math.abs(component.velocity.y)],
						[CardinalDirection.Down, () => Math.abs(component.velocity.y)],
						[_, () => component.velocity.y]
					),
				)
			}))
		}))
	};
}

function ballBlockCollisionDetectionReducer(state: GameState, action: { readonly type: "@@TICK", readonly deltaTime: Seconds }): GameState {
	const balls = state.componentEntityLinks.at("Ball").map(id => state.entities.at(id)!);
	const blocks = state.componentEntityLinks.at("Block").map(id => state.entities.at(id)!);

	return balls.reduce((state, ball) => {
		const ballCollision = Shape2.add((ball.components.at(ShapeComponent)! as ShapeComponent).shape, (ball.components.at(PositionComponent)! as PositionComponent).position);
		return blocks.reduce((state, block) => {
			const blockCollision = Shape2.add((block.components.at(ShapeComponent)! as ShapeComponent).shape, (block.components.at(PositionComponent)! as PositionComponent).position);
			if (!Shape2.collision(ballCollision, blockCollision)) {
				return state;
			}

			const shapeLines = Rectangle.lines(blockCollision as Rectangle);
			const bounceDir = patternMatch(_,
				[() => Shape2.collision(ballCollision, shapeLines.bottom), () => CardinalDirection.Down],
				[() => Shape2.collision(ballCollision, shapeLines.top), () => CardinalDirection.Up],
				[() => Shape2.collision(ballCollision, shapeLines.right), () => CardinalDirection.Left],
				[() => Shape2.collision(ballCollision, shapeLines.left), () => CardinalDirection.Right],
				[_, () => null]
			);
			return bounceBall(ball.id, destroyEntity(state, block.id), bounceDir);
		}, state);
	}, state);
}

function ballPaddleCollisionDetectionReducer(state: GameState, action: { readonly type: "@@TICK", readonly deltaTime: Seconds }): GameState {
	const balls = state.componentEntityLinks.at("Ball").map(id => state.entities.at(id)!);
	const paddles = state.componentEntityLinks.at("Paddle").map(id => state.entities.at(id)!);

	return balls.reduce((state, ball) => {
		const ballCollision = Shape2.add((ball.components.at(ShapeComponent)! as ShapeComponent).shape, (ball.components.at(PositionComponent)! as PositionComponent).position);
		return paddles.reduce((state, block) => {
			const blockCollision = Shape2.add((block.components.at(ShapeComponent)! as ShapeComponent).shape, (block.components.at(PositionComponent)! as PositionComponent).position);
			if (!Shape2.collision(ballCollision, blockCollision)) {
				return state;
			}

			const shapeLines = Rectangle.lines(blockCollision as Rectangle);
			const bounceDir = patternMatch(_,
				[() => Shape2.collision(ballCollision, shapeLines.bottom), () => CardinalDirection.Down],
				[() => Shape2.collision(ballCollision, shapeLines.top), () => CardinalDirection.Up],
				[() => Shape2.collision(ballCollision, shapeLines.right), () => CardinalDirection.Left],
				[() => Shape2.collision(ballCollision, shapeLines.left), () => CardinalDirection.Right],
				[_, () => null]
			);
			return bounceBall(ball.id, state, bounceDir);
		}, state);
	}, state);
}

function ballWallCollisionDetectionReducer(state: GameState, action: { readonly type: "@@TICK", readonly deltaTime: Seconds }): GameState {
	return state.componentEntityLinks.at("Ball")
		.map(id => state.entities.at(id)!)
		.reduce((state, ball) => {
			const ballCollision = Shape2.add((ball.components.at(ShapeComponent)! as ShapeComponent).shape, (ball.components.at(PositionComponent)! as PositionComponent).position);
			const bounce = patternMatch(ballCollision,
				[b => Shape2.collision(b, Line2(Point2(-320, -240), Point2(-320, 240))), () => CardinalDirection.Right],
				[b => Shape2.collision(b, Line2(Point2(320, -240), Point2(320, 240))), () => CardinalDirection.Left],
				[b => Shape2.collision(b, Line2(Point2(-320, 240), Point2(320, 240))), () => CardinalDirection.Up],
				[b => Shape2.collision(b, Line2(Point2(-320, -240), Point2(320, -240))), () => CardinalDirection.Down],
				[_, () => null]
			);
			return bounceBall(ball.id, state, bounce);
		}, state);
}

const breakoutGameReducer = createReducer(
	["@@TICK", velocityPositionTickReducer],
	["@@TICK", ballBlockCollisionDetectionReducer],
	["@@TICK", ballWallCollisionDetectionReducer],
	["@@TICK", ballPaddleCollisionDetectionReducer],
	["RequestGameRestart", () => initialState],
	["Player_StartMovingLeft", startPlayerMove(CardinalDirection.Left)],
	["Player_StartMovingRight", startPlayerMove(CardinalDirection.Right)],
	["Player_StopMovingLeft", stopPlayerMove(CardinalDirection.Left)],
	["Player_StopMovingRight", stopPlayerMove(CardinalDirection.Right)],
	[
		"GameReady",
		(state: GameState, action) => state.currentState === GameStateFlag.Initialising ? { ...state, currentState: GameStateFlag.Ready } : state
	],
	[
		"RequestStartGame",
		(state: GameState, action) =>
			state.currentState === GameStateFlag.Ready
				? {
					...requestStartGameEntityReducer(state, action),
					currentState: GameStateFlag.Playing
				}
				: state
	]
);

export const reducer = (state: GameState, action: GameAction) => state
	.fpipe(entityComponentReducer, action)
	.fpipe(breakoutGameReducer, action);

const renderShapes = createEntitiesStateMap(
	[PositionComponent, ShapeComponent, RenderComponent],
	(_: EntityId, position: PositionComponent, shape: ShapeComponent, render: RenderComponent) =>
		Fill(Shape2.add(shape.shape, position.position), render.colour)
);

export const render = (state: GameState) => [
	Clear,
	Origin(Point2(320, 240), [
		...renderShapes(state)
	])
];

function onKeyDown(k: Key, action: () => GameAction): Observable<GameAction> {
	return fromEvent(document, "keydown")
		.pipe(
			map((key: KeyboardEvent) => key.keyCode),
			filter(key => key === k),
			map(action)
		);
}

function onKeyUp(k: Key, action: () => GameAction): Observable<GameAction> {
	return fromEvent(document, "keyup")
		.pipe(
			filter((key: KeyboardEvent) => key.keyCode === k),
			map(action)
		);
}

const requestStartGame = onKeyDown(Key.Space, () => ({ type: "RequestStartGame" }));
const requestGameRestart = onKeyDown(Key.Escape, () => ({ type: "RequestGameRestart" }));
const playerMoveLeftStart = onKeyDown(Key.LeftArrow, () => ({ type: "Player_StartMovingLeft" }));
const playerMoveRightStart = onKeyDown(Key.RightArrow, () => ({ type: "Player_StartMovingRight" }));
const playerMoveLeftStop = onKeyUp(Key.LeftArrow, () => ({ type: "Player_StopMovingLeft" }));
const playerMoveRightStop = onKeyUp(Key.RightArrow, () => ({ type: "Player_StopMovingRight" }));

export const epic = (action$: Observable<GameAction>) => merge(
	interval(1000 / 60).pipe( map(() => ({ type: "@@TICK", deltaTime: 1 / 60 })) ),
	requestStartGame,
	requestGameRestart.pipe(
		mergeMap(action => concat(of(action), bootstrap)),
	),
	playerMoveLeftStart,
	playerMoveLeftStop,
	playerMoveRightStart,
	playerMoveRightStop
);
