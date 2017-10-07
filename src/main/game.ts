import { createEntitiesStateMap } from "../entity-component/create-entities-state-map.func";
import "../core/extensions";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

import { entityComponentReducer } from "../entity-component/entity-component.reducer";
import { BaseComponent } from "../entity-component/component-base.type";
import { BaseReduxApp } from "../functional/ReduxApp.type";
import { CardinalDirection } from "../core/models/direction.model";
import { combineReducers } from "../functional/combine-reducers.func";
import { createReducer } from "../functional/create-reducer.func";
import { EntitiesState } from "../entity-component/entities.state";
import { Entity } from "../entity-component/entity.type";
import { Clear, Fill, FrameCollection, Origin, Stroke } from "../functional/render-frame.model";
import { GenericAction } from "../functional/generic.action";
import { Key } from "../core/models/keys.model";
import { match, _ } from "../functional/utility-pattern-match.function";
import { merge } from "rxjs/observable/merge";
import { Observable } from "rxjs/Observable";
import { Point2, Rectangle, Circle, Shape2, Text2 } from "../core/models/shapes.model";
import { Seconds } from "../core/models/time.model";
import { SystemAction } from "../functional/system.action";
import { SystemState } from "../functional/system.state";
import { Vector2 } from "../core/maths/vector.maths";
import { createEntityReducer } from "../entity-component/create-entity-reducer.func";

type PhysicsState = {
	physics: {
		enableIntegrator: boolean
	}
};
const PhysicsState = <TState>(state: TState): TState & PhysicsState => ({
	...(state as any),
	physics: {
		enableIntegrator: true
	}
});

type GameState = SystemState & EntitiesState & PhysicsState;

type PaddleScoreComponent = BaseComponent & {
	readonly name: "PaddleScore";
	readonly score: number;
};

type PaddlePhysicsComponent = BaseComponent & {
	readonly name: "Physics_Paddle";
	readonly position: Point2;
	readonly movement: { readonly Left: number; readonly Right: number; };
	readonly collision: Rectangle;
};
const PaddlePhysicsComponent = (): PaddlePhysicsComponent => ({
	name: "Physics_Paddle",
	position: Point2(0, 200),
	movement: { Left: 0, Right: 0 },
	collision: Rectangle(-20, -5, 40, 10)
});

type BallPhysicsComponent = BaseComponent & {
	readonly name: "Physics_Ball";
	readonly position: Point2;
	readonly velocity: Vector2;
	readonly collision: Circle;
};
const BallPhysicsComponent = (): BallPhysicsComponent => ({
	name: "Physics_Ball",
	position: Point2(0, -200),
	velocity: Vector2(0, 0),
	collision: Circle(0, 0, 10)
});

type BallRenderableComponent = { readonly name: "Renderable_Ball"; };
const BallRenderableComponent = (): BallRenderableComponent => ({ name: "Renderable_Ball" });

type PaddleRenderableComponent = { readonly name: "Renderable_Paddle"; };
const PaddleRenderableComponent = (): PaddleRenderableComponent => ({ name: "Renderable_Paddle" });

const physicsBallReducer = createEntityReducer<GameState>(["Physics_Ball"], ({deltaTime}: AdvancePhysicsAction, component: BallPhysicsComponent) => [{
	...component,
	position: component.position
		.pipe(Vector2.add, Vector2.multiply(component.velocity, deltaTime))
		.pipe(Vector2.constraint, Vector2(-310, -230), Vector2(310, 230))
}]);
const physicsPaddleReducer = createEntityReducer<GameState>(["Physics_Paddle"], ({deltaTime}: AdvancePhysicsAction, component: PaddlePhysicsComponent) => [{
	...component,
	position: component.position
		.pipe(Vector2.add, Vector2(-component.movement.Left * deltaTime + component.movement.Right * deltaTime, 0))
		.pipe(Vector2.constraint, Vector2(-300, -240), Vector2(300, 240))
}]);

type AdvancePhysicsAction = { readonly type: "PHYS_AdvancePhysicsAction"; readonly deltaTime: Seconds; };
const AdvancePhysicsAction = (deltaTime: Seconds): AdvancePhysicsAction => ({ type: "PHYS_AdvancePhysicsAction", deltaTime });

type StartPlayerMoveLeftAction = { readonly type: "CTRL_StartPlayerMoveLeftAction" };
const StartPlayerMoveLeftAction = (): StartPlayerMoveLeftAction => ({ type: "CTRL_StartPlayerMoveLeftAction" });

type StopPlayerMoveLeftAction = { readonly type: "CTRL_StopPlayerMoveLeftAction" };
const StopPlayerMoveLeftAction = (): StopPlayerMoveLeftAction => ({ type: "CTRL_StopPlayerMoveLeftAction" });

type StartPlayerMoveRightAction = { readonly type: "CTRL_StartPlayerMoveRightAction" };
const StartPlayerMoveRightAction = (): StartPlayerMoveRightAction => ({ type: "CTRL_StartPlayerMoveRightAction" });

type StopPlayerMoveRightAction = { readonly type: "CTRL_StopPlayerMoveRightAction" };
const StopPlayerMoveRightAction = (): StopPlayerMoveRightAction => ({ type: "CTRL_StopPlayerMoveRightAction" });

type BounceBallAction = { readonly type: "PHYS_BounceBallAction"; readonly direction: CardinalDirection; };

const applyPlayerMovementAction = (overlay: Partial<{ Left: number; Right: number; }>) =>
	createEntityReducer<GameState>(["Controller_Player", "Physics_Paddle"], (action, ctrl, component: PaddlePhysicsComponent) => [ctrl, {
		...component,
		movement: {
			...component.movement,
			...overlay
		}
	}]);

const applyStartBallMovementAction = createEntityReducer<GameState>(["Physics_Ball"], (action, component) => [{
	...component,
	velocity: Vector2(100, 100)
}]);

const ControllerPlayerComponent = () => ({ name: "Controller_Player" });

const applyStartPlayerLeftAction = applyPlayerMovementAction({ Left: 100 });
const applyStopPlayerLeftAction = applyPlayerMovementAction({ Left: 0 });
const applyStartPlayerRightAction = applyPlayerMovementAction({ Right: 100 });
const applyStopPlayerRightAction = applyPlayerMovementAction({ Right: 0 });

const applyAwardScoreAction = createEntityReducer<GameState>(["PaddleScore"], (action, component: PaddleScoreComponent) => [
	{ ...component, score: component.score + 1 }
]);
const applyResetScoreAction = createEntityReducer<GameState>(["PaddleScore"], (action, component: PaddleScoreComponent) => [
	{ ...component, score: 0 }
]);

const playerInputReducer = createReducer(
	["CTRL_StartPlayerMoveLeftAction", applyStartPlayerLeftAction],
	["CTRL_StopPlayerMoveLeftAction", applyStopPlayerLeftAction],
	["CTRL_StartPlayerMoveRightAction", applyStartPlayerRightAction],
	["CTRL_StopPlayerMoveRightAction", applyStopPlayerRightAction],
	["CTRL_StartBallMovementAction", applyStartBallMovementAction],
	["GAME_AwardScore", applyAwardScoreAction],
	["GAME_ResetScore", applyResetScoreAction]
);

const physicsBallBounceReducer = createEntityReducer<GameState>(
	["Physics_Ball"],
	(action: BounceBallAction, component: BallPhysicsComponent) => [{
		...component,
		velocity: {
			x: match(action.direction,
				[CardinalDirection.Left, () => -Math.abs(component.velocity.x)],
				[CardinalDirection.Right, () => Math.abs(component.velocity.x)],
				[_, () => component.velocity.x]
			),
			y: match(action.direction,
				[CardinalDirection.Down, () => Math.abs(component.velocity.y)],
				[CardinalDirection.Up, ()=> -Math.abs(component.velocity.y)],
				[_, () => component.velocity.y]
			),
		}
	} as BallPhysicsComponent]
);

const physicsReducer = createReducer<GameState, GenericAction>(
	["DEBUG_PHYS_TogglePhysicsAction", (state: GameState, action: GenericAction) => ({ ...state, physics: { ...state.physics, enableIntegrator: !state.physics.enableIntegrator } })],
	["PHYS_AdvancePhysicsAction", physicsBallReducer],
	["PHYS_AdvancePhysicsAction", physicsPaddleReducer],
	["PHYS_BounceBallAction", physicsBallBounceReducer]
);

function ballWallBounceCheck(state: GameState): GenericAction[] {
	return state.componentEntityLinks.at("Physics_Ball")
		.map(entityId => state.entities.at(entityId)!)
		.map(entity => entity.components.at("Physics_Ball")!)
		.mergeMap(getActions);

	function getActions(ball: BallPhysicsComponent): GenericAction[] {
		return [
			...match(
				ball.position,
				[pos => pos.x >= 310, () => [{ type: "PHYS_BounceBallAction", direction: CardinalDirection.Left }]],
				[pos => pos.x <= -310, () => [{ type: "PHYS_BounceBallAction", direction: CardinalDirection.Right }]],
				[_, () => []]
			),
			...match(
				ball.position,
				[pos => pos.y >= 230, () => [{ type: "PHYS_BounceBallAction", direction: CardinalDirection.Up }]],
				[pos => pos.y <= -230, () => [{ type: "PHYS_BounceBallAction", direction: CardinalDirection.Down }]],
				[_, () => []]
			)
		]
	}
}

function ballPaddleBounceCheck(state: GameState): GenericAction[] {
	const balls = state.componentEntityLinks.at("Physics_Ball")
		.map(entity => state.entities.at(entity)!)
		.map(entity => entity.components.at("Physics_Ball")!) as BallPhysicsComponent[];
	const paddles = state.componentEntityLinks.at("Physics_Paddle")
		.map(entity => state.entities.at(entity)!)
		.map(entity => entity.components.at("Physics_Paddle")!) as PaddlePhysicsComponent[];

	return balls.mergeMap(ball => paddles.mergeMap(paddle => ballPaddleCollisionCheck(ball, paddle)));

	function ballPaddleCollisionCheck(ball: BallPhysicsComponent, paddle: PaddlePhysicsComponent) {
		const ballCollisionMap = Shape2.add(ball.collision, ball.position);
		const paddleCollisionMap = Shape2.add(paddle.collision, paddle.position);

		if (Shape2.collision(ballCollisionMap, paddleCollisionMap)) {
			const paddleBounding = Shape2.bounding(paddleCollisionMap);
			const paddleLines = Rectangle.lines(paddleBounding);

			if (Shape2.collision(ballCollisionMap, paddleLines.top)) {
				return [{ type: "GAME_AwardScore" }, { type: "PHYS_BounceBallAction", direction: CardinalDirection.Up }];
			} else if (Shape2.collision(ballCollisionMap, paddleLines.bottom)) {
				return [{ type: "PHYS_BounceBallAction", direction: CardinalDirection.Down }];
			} else if (Shape2.collision(ballCollisionMap, paddleLines.right)) {
				return [{ type: "PHYS_BounceBallAction", direction: CardinalDirection.Right }];
			} else if (Shape2.collision(ballCollisionMap, paddleLines.right)) {
				return [{ type: "PHYS_BounceBallAction", direction: CardinalDirection.Left }];
			} else {
				return [];
			}
		} else {
			return [];
		}
	}
}

export class Game extends BaseReduxApp<GameState, GenericAction> {
	constructor() {
		super(SystemState, EntitiesState([
			Entity<BaseComponent>("Ball", BallPhysicsComponent(), BallRenderableComponent()),
			Entity<BaseComponent>("Paddle", PaddlePhysicsComponent(), PaddleRenderableComponent(), ControllerPlayerComponent()),
			Entity<BaseComponent>("PaddleScore", ({ name: "PaddleScore", score: 0 } as PaddleScoreComponent))
		]), PhysicsState);
	}

	public reducer(state: GameState, action: GenericAction): GameState {
		const x1 = entityComponentReducer(state, action);
		const x2 = playerInputReducer(x1, action);
		const x3 = physicsReducer(x2, action);
		return x3;
	}

	public update(tick: Observable<{ state: GameState, deltaTime: Seconds }>): Observable<GenericAction> {
		return merge(
			tick
				.filter(({ state }) => state.physics.enableIntegrator)
				.map(({ deltaTime }) => AdvancePhysicsAction(deltaTime)),
			tick.mergeMap(({ state }) => ballWallBounceCheck(state)),
			tick.mergeMap(({ state }) => ballPaddleBounceCheck(state))
		);
	}

	public render(state: GameState): FrameCollection {
		return [
			Clear,
			Origin({ x: 320, y: 240 }, [
				createEntitiesStateMap(
					["Physics_Paddle"],
					(paddle: PaddlePhysicsComponent) => Fill(Shape2.add(paddle.collision, paddle.position), "lightblue")
				)(state),
				createEntitiesStateMap(
					["Physics_Ball"],
					(ball: BallPhysicsComponent) => Fill(Shape2.add(ball.collision, ball.position), "lightblue")
				)(state),

				createEntitiesStateMap(
					["PaddleScore"],
					(self: PaddleScoreComponent) => Stroke(Text2(`Score ${self.score}`, -300, -200, undefined, "32px"), "white")
				)(state)
			])
		];
	}

	public epic(action$: Observable<GenericAction>, state: () => GameState): Observable<GenericAction> {
		return merge(
			action$
				.filter(action => SystemAction.KeyDown(action) && action.key === Key.LeftArrow)
				.map(() => ({ type: "CTRL_StartPlayerMoveLeftAction" })),
			action$
				.filter(action => SystemAction.KeyUp(action) && action.key === Key.LeftArrow)
				.map(() => ({ type: "CTRL_StopPlayerMoveLeftAction" })),
			action$
				.filter(action => SystemAction.KeyDown(action) && action.key === Key.RightArrow)
				.map(() => ({ type: "CTRL_StartPlayerMoveRightAction" })),
			action$
				.filter(action => SystemAction.KeyUp(action) && action.key === Key.RightArrow)
				.map(() => ({ type: "CTRL_StopPlayerMoveRightAction" })),
			action$
				.filter(action => SystemAction.KeyUp(action) && action.key === Key.Space)
				.mergeMap(action => [{ type: "GAME_ResetScore" }, { type: "CTRL_StartBallMovementAction" }])
		);
	}
}
