import { List } from "immutable";
import { Body } from "matter-js";
import { Observable } from "rxjs/Observable";
import { interval } from "rxjs/observable/interval";
import { merge } from "rxjs/observable/merge";
import { pipe } from "rxjs/util/pipe";

import { AppDrivers } from "../pauper/app-drivers";
import { createEntitiesStateFilter } from "../pauper/ecs/create-entities-state-filter.func";
import { createEntitiesStateMap } from "../pauper/ecs/create-entities-state-map.func";
import { createEntityReducer } from "../pauper/ecs/create-entity-reducer.func";
import { EntityId } from "../pauper/ecs/entity-base.type";
import { AttachComponentAction, CreateEntityAction, DestroyEntityAction } from "../pauper/ecs/entity-component.actions";
import { entityComponentReducer } from "../pauper/ecs/entity-component.reducer";
import { exponentialInterpolation } from "../pauper/maths/interpolation.maths";
import { Colour } from "../pauper/models/colour.model";
import { Rectangle, Shape2, Text2, Point2, Circle } from "../pauper/models/shapes.model";
import { Seconds } from "../pauper/models/time.model";
import { HardBodyComponent } from "../pauper/physics/component/HardBodyComponent";
import { StaticBodyComponent } from "../pauper/physics/component/StaticBodyComponent";
import { createPhysicsReducer } from "../pauper/physics/reducer/physics-body.reducer";
import { Clear, Fill, Origin, RenderTarget, Rotate } from "../pauper/render/render-frame.model";
import { FloatingScoreComponent } from "./components/FloatingScoreComponent";
import { RenderedComponent } from "./components/RenderedComponent";
import { ScoreBucketComponent } from "./components/ScoreBucketComponent";
import { SensorPhysicsComponent } from "./components/SensorPhysicsComponent";
import { GameAction, GameState } from "./game.model";
import { map, mergeMap, filter, ignoreElements } from "rxjs/operators";

const physicsPreReducer = createEntityReducer<GameState>(["HardBodyComponent"], (state, action, physics: HardBodyComponent) => {
	if (physics.pendingForces.length === 0) {
		return [physics];
	}

	physics.pendingForces.forEach(({ location, force }) => Body.applyForce(physics._body!, location, force));
	return [{ ...physics, pendingForces: [] }];
});

const physicsPostReducer = createEntityReducer<GameState>(["HardBodyComponent"], (state, action, physics: HardBodyComponent) => {
	const motion = physics._body!.speed * physics._body!.speed + physics._body!.angularSpeed * physics._body!.angularSpeed;
	const isResting = motion < 0.075;

	return [{
		...physics,
		restingTime: isResting ? physics.restingTime + action.deltaTime : 0,
		position: {
			x: physics._body!.position.x,
			y: physics._body!.position.y
		},
		velocity: {
			x: physics._body!.velocity.x,
			y: physics._body!.velocity.y,
		},
		angularVelocity: physics._body!.angularVelocity,
		rotation: physics._body!.angle
	}];
});


const deadPhysicsEntities = createEntitiesStateFilter(["HardBodyComponent"], (component: HardBodyComponent) => component.position.y > 1000);
const restingPhysicsEntities = createEntitiesStateFilter(["HardBodyComponent"], (component: HardBodyComponent) => component.restingTime >= 2);
const fadedAwayTextBoxes = createEntitiesStateFilter(["FloatingScoreComponent"], (component: FloatingScoreComponent, currentTick: number) => currentTick > component.startingTick + component.lifespan);

const physicsReducer = createPhysicsReducer<GameState>((state, result) => ({
	...state,
	effects: state.effects
		.concat(result.collisionStarts.map(collision => ({ type: "@@COLLISION_START", collision } as GameAction)))
		.concat(result.collisionEnds.map(collision => ({ type: "@@COLLISION_END", collision } as GameAction)))
}));

export const reducer = (state: GameState, action: GameAction): GameState => {
	switch (action.type) {
		case "@@TICK":
			return pipe(
				(s: GameState) => physicsPostReducer(s, action),
				s => ({ ...s, runtime: s.runtime + action.deltaTime }),
				s => ({
					...s,
					effects: s.effects
						.concat(Array.from(fadedAwayTextBoxes(s, s.runtime)).map(DestroyEntityAction))
						.concat(Array.from(restingPhysicsEntities(s)).map(ball => ({ type: "BALL_FINISHED", ball } as GameAction)))
				})
			)(state);

		case "@@COLLISION_START":
			if (state.componentEntityLinks.get("HardBodyComponent", List<EntityId>()).some(e => e === action.collision.a || e === action.collision.b)) {
				return {
					...state,
					effects: state.effects.concat({ type: "PlaySoundEffect", sound: "boing" } as GameAction)
				};
			}
			return state;

		case "BALL_FINISHED":
			const ballHardBodyComponent = state.entities.get(action.ball)!.components.get("HardBodyComponent")! as HardBodyComponent;
			const bucket = state.componentEntityLinks.get("SensorPhysicsComponent", List<EntityId>())
				.find(bucket => {
					const sensor = (state.entities.get(bucket)!.components.get("SensorPhysicsComponent")! as SensorPhysicsComponent);
					return Shape2.collision(sensor.shape, Shape2.add(ballHardBodyComponent.shape, ballHardBodyComponent.position));
				});

			const bucketValue = bucket != null
				? (state.entities.get(bucket)!.components.get("ScoreBucketComponent")! as ScoreBucketComponent).value
				: 0;

			const entityId = EntityId();

			return {
				...state,
				score: state.score + bucketValue,
				effects: state.effects.concat([
					DestroyEntityAction(action.ball),
					CreateEntityAction(entityId),
					AttachComponentAction(entityId, FloatingScoreComponent(bucketValue, ballHardBodyComponent.position, state.runtime))
				])
			};

		default:
			return physicsReducer(entityComponentReducer(state, action), action);
	}
};

const entityRenderer = createEntitiesStateMap(["RenderedComponent", "HardBodyComponent"], (id: string, { rgb }: RenderedComponent, physics: HardBodyComponent) => {
	return Origin(physics.position, [
		Rotate(physics.rotation, [
			Fill(physics.shape, Colour(rgb.r, rgb.g, rgb.b, exponentialInterpolation(Math.E)(1, 0)(Math.max(1, physics.restingTime) - 1) ** 2))
		])
	]);
});

const staticEntityRenderer = createEntitiesStateMap(["RenderedComponent", "StaticBodyComponent"], (id: string, { rgb }: RenderedComponent, { position, shape }: StaticBodyComponent) => {
	return Origin(position, [
		Fill(shape, rgb)
	]);
});

const scoreTextRenderer = createEntitiesStateMap(["FloatingScoreComponent"], (id: string, physics: FloatingScoreComponent, runtime: Seconds) => {
	const interpolateTo = (runtime - physics.startingTick) / physics.lifespan;
	const position = physics.position(interpolateTo);

	return [
		Fill(Text2(`${physics.score}`, position.x, position.y, "24px", "sans-serif"), Colour(255, 255, 255, exponentialInterpolation(Math.E)(1, 0)(interpolateTo)))
	];
});

export const render = (state: GameState) => [
	Clear(Colour(0, 0, 0)),
	Array.from(staticEntityRenderer(state)),

	Fill(Text2(`Score: ${state.score}`, 30, 30, "24px", "sans-serif"), Colour(255, 0, 0)),
	Array.from(entityRenderer(state)),
	Array.from(scoreTextRenderer(state, state.runtime))
];

// TODO: Focus-awareness should be moved into some kind of 'System Driver'
const tabAwareInterval = (period: Seconds, drivers: AppDrivers) => {
	return interval(period * 1000);
};

export const epic = (action$: Observable<GameAction>, drivers: AppDrivers) => merge<GameAction>(
	tabAwareInterval(0.01, drivers).pipe(map(() => ({ type: "@@TICK", deltaTime: 0.01 }))),
	tabAwareInterval(0.01, drivers).pipe(map(() => ({ type: "@@ADVANCE_PHYSICS", deltaTime: 0.01 }))),
	drivers.mouse!.mouseUp().pipe(
		mergeMap(() => {
			const id = EntityId();
			const physics = HardBodyComponent(Point2((Math.random() * 306 + 106) | 0, 25), Circle(0, 0, (Math.random() * 12.5 + 2.5) | 0), { density: (Math.random() * 40 + 10) | 0, elasticity: ((Math.random() * 100) | 0) / 100 });
			return [
				CreateEntityAction(id),
				AttachComponentAction(id, physics),
				AttachComponentAction(id, RenderedComponent(255 * physics.elasticity | 0, 255 - physics.density | 0, 255 | 0))
			];
		})
	),
	action$.pipe(
		filter(action => action.type === "PlaySoundEffect"),
		map(action => (action as ({ readonly type: "PlaySoundEffect"; readonly sound: string })).sound),
		map(sound => drivers.loader!.getSoundEffect(sound)),
		map(sound => drivers.audio!.play(sound)),
		ignoreElements()
	)
);

export const postprocess = (state: GameState): {
	readonly state: GameState;
	readonly actions: ReadonlyArray<GameAction>;
} => ({
	state: {
		...state,
		effects: []
	},
	actions: state.effects
});
