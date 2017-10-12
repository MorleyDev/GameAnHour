import { Line2 } from "../pauper/core/models/line/line.model";
import { CardinalDirection } from "../pauper/core/models/direction.model";
import { _, patternMatch } from "../pauper/functional/utility-pattern-match.function";
import { Rectangle } from "../pauper/core/models/rectangle/rectangle.model";
import { destroyEntity } from "../pauper/entity-component/entity-component.reducer";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Vector2 } from "../pauper/core/maths/vector.maths";
import { Key } from "../pauper/core/models/keys.model";
import { Point2, Shape2 } from "../pauper/core/models/shapes.model";
import { createEntitiesStateMap, entityComponentReducer } from "../pauper/entity-component";
import { createEntityReducer } from "../pauper/entity-component/create-entity-reducer.func";
import { EntityId } from "../pauper/entity-component/entity-base.type";
import { TickAction } from "../pauper/functional";
import { createReducer } from "../pauper/functional/create-reducer.func";
import { Clear, Fill, Origin } from "../pauper/functional/render-frame.model";
import { KeyDownAction } from "../pauper/functional/system-keydown.action";
import { PositionComponent } from "./components/PositionComponent";
import { RenderComponent } from "./components/RenderComponent";
import { ShapeComponent } from "./components/ShapeComponent";
import { VelocityComponent } from "./components/VelocityComponent";
import { GameAction, GameState, GameStateFlag } from "./game.model";

const requestStartGameEntityReducer = createEntityReducer(
	[VelocityComponent, "Ball"],
	((state, action, velocity: VelocityComponent, ball: any) => [{ ...velocity, velocity: Vector2(100, -100) }, ball])
);

const velocityPositionTickReducer = createEntityReducer(
	[VelocityComponent, PositionComponent],
	(state: GameState, action: TickAction, velocity: VelocityComponent, position: PositionComponent) => [
		velocity,
		{
			name: PositionComponent,
			position: Vector2.add(position.position, Vector2.multiply(velocity.velocity, action.deltaTime))
		}
	]
);

function ballBlockCollisionDetectionReducer(state: GameState, action: TickAction): GameState {
	const balls = state.componentEntityLinks.at("Ball").map(id => state.entities.at(id)!);
	const blocks = state.componentEntityLinks.at("Block").map(id => state.entities.at(id)!);

	let nextState = state;
	balls.forEach(ball => {
		const ballCollision = Shape2.add((ball.components.at(ShapeComponent)! as ShapeComponent).shape, (ball.components.at(PositionComponent)! as PositionComponent).position);
		blocks.forEach(block => {
			const blockCollision = Shape2.add((block.components.at(ShapeComponent)! as ShapeComponent).shape, (block.components.at(PositionComponent)! as PositionComponent).position);

			if (Shape2.collision(ballCollision, blockCollision)) {
				const shapeLines = Rectangle.lines(blockCollision as Rectangle);
				nextState = destroyEntity(state, block.id);

				const bounceDir = patternMatch(_,
					[() => Shape2.collision(ballCollision, shapeLines.bottom), () => CardinalDirection.Down],
					[() => Shape2.collision(ballCollision, shapeLines.top), () => CardinalDirection.Up],
					[() => Shape2.collision(ballCollision, shapeLines.right), () => CardinalDirection.Left],
					[() => Shape2.collision(ballCollision, shapeLines.left), () => CardinalDirection.Right],
					[_, () => null]
				);
				if (bounceDir != null) {
					nextState = {
						...nextState,
						entities: nextState.entities.update(ball.id, entity => ({
							...entity,
							components: entity.components.update(VelocityComponent, (component: VelocityComponent) => ({
								...component,
								velocity: Vector2(
									patternMatch(bounceDir,
										[CardinalDirection.Left, () => -Math.abs(component.velocity.x)],
										[CardinalDirection.Right, () => Math.abs(component.velocity.x)],
										[_, () => component.velocity.x]
									),
									patternMatch(bounceDir,
										[CardinalDirection.Up, () => -Math.abs(component.velocity.y)],
										[CardinalDirection.Down, () => Math.abs(component.velocity.y)],
										[_, () => component.velocity.y]
									),
								)
							}))
						}))
					};
				}
			}
		});
	});
	return nextState;
}


function ballWallCollisionDetectionReducer(state: GameState, action: TickAction): GameState {
	const balls = state.componentEntityLinks.at("Ball").map(id => state.entities.at(id)!);

	let nextState = state;
	balls.forEach(ball => {
		const ballCollision = Shape2.add((ball.components.at(ShapeComponent)! as ShapeComponent).shape, (ball.components.at(PositionComponent)! as PositionComponent).position);

		const bounce = patternMatch(ballCollision,
			[b => Shape2.collision(b, Line2(Point2(-320, -240), Point2(-320, 240))), () => CardinalDirection.Right],
			[b => Shape2.collision(b, Line2(Point2(320, -240), Point2(320, 240))), () => CardinalDirection.Left],
			[b => Shape2.collision(b, Line2(Point2(-320, 240), Point2(320, 240))), () => CardinalDirection.Up],
			[b => Shape2.collision(b, Line2(Point2(-320, -240), Point2(320, -240))), () => CardinalDirection.Down],
			[_, () => null]
		);
		if (bounce != null) {
			nextState = {
				...nextState,
				entities: nextState.entities.update(ball.id, entity => ({
					...entity,
					components: entity.components.update(VelocityComponent, (component: VelocityComponent) => ({
						...component,
						velocity: Vector2(
							patternMatch(bounce,
								[CardinalDirection.Left, () => -Math.abs(component.velocity.x)],
								[CardinalDirection.Right, () => Math.abs(component.velocity.x)],
								[_, () => component.velocity.x]
							),
							patternMatch(bounce,
								[CardinalDirection.Up, () => -Math.abs(component.velocity.y)],
								[CardinalDirection.Down, () => Math.abs(component.velocity.y)],
								[_, () => component.velocity.y]
							),
						)
					}))
				}))
			};
		}
	});
	return nextState;
}

const breakoutGameReducer = createReducer(
	["@@TICK", velocityPositionTickReducer],
	["@@TICK", ballBlockCollisionDetectionReducer],
	["@@TICK", ballWallCollisionDetectionReducer],
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
					currentState: GameStateFlag.Ready
				}
				: state
	]
);

export const reducer = (state: GameState, action: GameAction) => state
	.pipe(entityComponentReducer, action)
	.pipe(breakoutGameReducer, action);

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

export const epic = (action$: Observable<GameAction>) => merge(
	action$
		.filter(KeyDownAction.is)
		.map((action: KeyDownAction) => action.key)
		.filter(key => key === Key.Space)
		.map(_ => ({ type: "RequestStartGame" }))
);
