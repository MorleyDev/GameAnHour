import { List } from "immutable";
import { Body } from "matter-js";
import { Observable } from "rxjs/Observable";
import { interval } from "rxjs/observable/interval";
import { merge } from "rxjs/observable/merge";
import { filter, map, mergeMap, tap } from "rxjs/operators";
import { ignoreElements } from "rxjs/operators/ignoreElements";
import { pipe } from "rxjs/util/pipe";

import { cosineInterpolation } from "../pauper/core/maths/interpolation.maths";
import { Circle, Point2, Shape2, Text2 } from "../pauper/core/models/shapes.model";
import { Seconds } from "../pauper/core/models/time.model";
import { isBrowser } from "../pauper/core/utility/is-browser";
import { createEntitiesStateMap, entityComponentReducer } from "../pauper/entity-component";
import { createEntitiesStateFilter } from "../pauper/entity-component/create-entities-state-filter.func";
import { createEntityReducer } from "../pauper/entity-component/create-entity-reducer.func";
import { EntityId } from "../pauper/entity-component/entity-base.type";
import { AttachComponentAction, CreateEntityAction, DestroyEntityAction } from "../pauper/entity-component/entity-component.actions";
import { AppDrivers } from "../pauper/functional/app-drivers";
import { Clear, Fill, Origin, Rotate } from "../pauper/functional/render-frame.model";
import { FloatingScoreComponent } from "./components/FloatingScoreComponent";
import { PhysicsComponent } from "./components/PhysicsComponent";
import { RenderedComponent } from "./components/RenderedComponent";
import { ScoreBucketComponent } from "./components/ScoreBucketComponent";
import { SensorPhysicsComponent } from "./components/SensorPhysicsComponent";
import { StaticPhysicsComponent } from "./components/StaticPhysicsComponent";
import { GameAction, GameState } from "./game.model";
import { engine, updateEngine } from "./physics-engine";

const physicsPreReducer = createEntityReducer<GameState>(["PhysicsComponent"], (state, action, physics: PhysicsComponent) => {
	if (physics.pendingForces.length === 0) {
		return [physics];
	}

	physics.pendingForces.forEach(({ location, force }) => Body.applyForce(physics._body!, location, force));
	return [{ ...physics, pendingForces: [] }];
});

const physicsPostReducer = createEntityReducer<GameState>(["PhysicsComponent"], (state, action, physics: PhysicsComponent) => {
	const motion = physics._body!.speed * physics._body!.speed + physics._body!.angularSpeed * physics._body!.angularSpeed;
	const isResting = motion < 0.1;

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


const deadPhysicsEntities = createEntitiesStateFilter(["PhysicsComponent"], (component: PhysicsComponent) => component.position.y > 1000);
const restingPhysicsEntities = createEntitiesStateFilter(["PhysicsComponent"], (component: PhysicsComponent) => component.restingTime >= 1);
const fadedAwayTextBoxes = createEntitiesStateFilter(["FloatingScoreComponent"], (component: FloatingScoreComponent, currentTick: number) => currentTick > component.startingTick + component.lifespan);

export const reducer = (state: GameState, action: GameAction): GameState => {
	switch (action.type) {
		case "@@TICK":
			return pipe(
				(s: GameState) => physicsPreReducer(s, action),
				s => {
					const physics = updateEngine(engine, action.deltaTime);

					return {
						...s,
						effects: s.effects
							.concat(physics.collisionStart.map(collision => ({ type: "@@COLLISION_START", collision } as GameAction)))
							.concat(physics.collisionEnd.map(collision => ({ type: "@@COLLISION_END", collision } as GameAction)))
					};
				},
				s => physicsPostReducer(s, action),
				s => ({ ...s, runtime: s.runtime + action.deltaTime }),
				s => ({
					...s,
					effects: s.effects
						.concat(Array.from(fadedAwayTextBoxes(s, s.runtime)).map(DestroyEntityAction))
						.concat(Array.from(restingPhysicsEntities(s)).map(ball => ({ type: "BALL_FINISHED", ball } as GameAction)))
				})
			)(state);

		case "@@COLLISION_START":
			if (state.componentEntityLinks.get("PhysicsComponent", List<EntityId>()).some(e => e === action.collision.a || e === action.collision.b)) {
				return {
					...state,
					effects: state.effects.concat({ type: "PlaySoundEffect", sound: "boing" } as GameAction)
				};
			}
			return state;

		case "BALL_FINISHED":
			const ballPhysicsComponent = state.entities.get(action.ball)!.components.get("PhysicsComponent")! as PhysicsComponent;
			const bucket = state.componentEntityLinks.get("SensorPhysicsComponent", List<EntityId>())
				.find(bucket => {
					const sensor = (state.entities.get(bucket)!.components.get("SensorPhysicsComponent")! as SensorPhysicsComponent);
					return Shape2.collision(sensor.shape, Shape2.add(ballPhysicsComponent.shape, ballPhysicsComponent.position));
				});

			if (bucket == null) {
				return {
					...state,
					effects: state.effects.concat(DestroyEntityAction(action.ball))
				};
			} else {
				const scoreBucketComponent = state.entities.get(bucket)!.components.get("ScoreBucketComponent")! as ScoreBucketComponent;
				const entityId = EntityId();

				return {
					...state,
					score: state.score + scoreBucketComponent.value,
					effects: state.effects.concat([
						DestroyEntityAction(action.ball),
						CreateEntityAction(entityId),
						AttachComponentAction(entityId, FloatingScoreComponent(scoreBucketComponent.value, ballPhysicsComponent.position, state.runtime))
					])
				};
			}

		default:
			return entityComponentReducer(state, action);
	}
};

const entityRenderer = createEntitiesStateMap(["RenderedComponent", "PhysicsComponent"], (id: string, { rgb }: RenderedComponent, physics: PhysicsComponent) => {
	return Origin(physics.position, [
		Rotate(physics.rotation, [
			Fill(physics.shape, `rgba(${rgb}, ${(cosineInterpolation(1, 0)(physics.restingTime))})`)
		])
	]);
});

const staticEntityRenderer = createEntitiesStateMap(["RenderedComponent", "StaticPhysicsComponent"], (id: string, { rgb }: RenderedComponent, { position, shape }: StaticPhysicsComponent) => {
	return Origin(position, [
		Fill(shape, `rgb(${rgb})`)
	]);
});

const scoreTextRenderer = createEntitiesStateMap(["FloatingScoreComponent"], (id: string, physics: FloatingScoreComponent, runtime: Seconds) => {
	const interpolateTo = (runtime - physics.startingTick) / physics.lifespan;
	const position = physics.position(interpolateTo);

	return [
		Fill(Text2(`${physics.score}`, position.x, position.y), `rgba(255, 255, 255, ${1 - interpolateTo})`)
	];
});
export const render = (state: GameState) => [
	Clear("black"),
	...entityRenderer(state),
	...staticEntityRenderer(state),
	...scoreTextRenderer(state, state.runtime),
	Fill(Text2(`Score: ${state.score}`, 30, 30), "red")
];

// TODO: Focus-awareness should be moved into some kind of 'System Driver'
const tabAwareInterval = (period: Seconds) => {
	if (!isBrowser) {
		return interval(period * 1000);
	}
	return interval(period * 1000).pipe(filter(() => !document.hidden));
};

export const epic = (action$: Observable<GameAction>, drivers: AppDrivers) => merge<GameAction>(
	tabAwareInterval(0.01).pipe(map(() => ({ type: "@@TICK", deltaTime: 0.01 }))),
	drivers.mouse!.mouseUp().pipe(
		mergeMap(() => {
			const id = EntityId();
			const physics = PhysicsComponent(Point2((Math.random() * 306 + 106) | 0, 25), Circle(0, 0, (Math.random() * 12.5 + 2.5) | 0), { density: (Math.random() * 40 + 10) | 0, elasticity: ((Math.random() * 100) | 0) / 100 });
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
