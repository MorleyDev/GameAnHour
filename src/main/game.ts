import { Body } from "matter-js";
import { Observable } from "rxjs/Observable";
import { interval } from "rxjs/observable/interval";
import { merge } from "rxjs/observable/merge";
import { filter, map, mergeMap } from "rxjs/operators";

import { Circle, Point2 } from "../pauper/core/models/shapes.model";
import { Seconds } from "../pauper/core/models/time.model";
import { isBrowser } from "../pauper/core/utility/is-browser";
import { createEntitiesStateMap, entityComponentReducer } from "../pauper/entity-component";
import { createEntitiesStateFilter } from "../pauper/entity-component/create-entities-state-filter.func";
import { createEntityReducer } from "../pauper/entity-component/create-entity-reducer.func";
import { EntityId } from "../pauper/entity-component/entity-base.type";
import { AttachComponentAction, CreateEntityAction, DestroyEntityAction } from "../pauper/entity-component/entity-component.actions";
import { AppDrivers } from "../pauper/functional/app-drivers";
import { Clear, Fill, Origin, Rotate } from "../pauper/functional/render-frame.model";
import { PhysicsComponent } from "./components/PhysicsComponent";
import { SensorPhysicsComponent } from "./components/SensorPhysicsComponent";
import { StaticPhysicsComponent } from "./components/StaticPhysicsComponent";
import { GameAction, GameState } from "./game.model";
import { engine, updateEngine } from "./physics-engine";
import { List } from "immutable";

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

export const reducer = (state: GameState, action: GameAction): GameState => {
	switch (action.type) {
		case "@@TICK":
			const newState = physicsPreReducer(state, action);
			const result = updateEngine(engine, action.deltaTime);
			const postState = physicsPostReducer(state, action);
			return {
				...postState,
				effects: postState.effects
					.concat(result.collisionStart.map(collision => ({ type: "@@COLLISION_START", collision } as GameAction)))
					.concat(result.collisionEnd.map(collision => ({ type: "@@COLLISION_END", collision } as GameAction)))
			};

		case "@@COLLISION_START":
			const isASensor = state.componentEntityLinks.get("SensorPhysicsComponent", List<EntityId>()).some(e => e === action.collision.a);
			if (isASensor) {
				const isBBall = state.componentEntityLinks.get("PhysicsComponent", List<EntityId>()).some(e => e === action.collision.b);
				if (!isBBall) {
					return state;
				}
				return {
					...state
				};
			}

			const isBSensor = state.componentEntityLinks.get("SensorPhysicsComponent", List<EntityId>()).some(e => e === action.collision.b);
			if (isBSensor) {
				const isABall = state.componentEntityLinks.get("PhysicsComponent", List<EntityId>()).some(e => e === action.collision.a);
				if (!isABall) {
					return state;
				}
				return {
					...state
				};
			}

			return state;
		default:
			return entityComponentReducer(state, action);
	}
};

const entityRenderer = createEntitiesStateMap(["PhysicsComponent"], (id: string, physics: PhysicsComponent) => {
	return Origin(physics.position, [
		Rotate(physics.rotation, [
			Fill(physics.shape, `rgba(${((255 * physics.elasticity)) | 0}, ${(255 - physics.density) | 0}, ${(255) | 0}, ${Math.min(1, 2 - (physics.restingTime * 2))})`)
		])
	]);
});

const staticEntityRenderer = createEntitiesStateMap(["StaticPhysicsComponent"], (id: string, physics: StaticPhysicsComponent) => {
	return Origin(physics.position, [
		Fill(physics.shape, "lightblue")
	]);
});

const sensorEntityRenderer = createEntitiesStateMap(["SensorPhysicsComponent"], (id: string, physics: SensorPhysicsComponent) => {
	return Origin(physics.position, [
		Fill(physics.shape, "rgba(255, 0, 0, 0.2)")
	]);
});

export const render = (state: GameState) => [
	Clear("black"),
	...entityRenderer(state),
	...staticEntityRenderer(state)
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
	tabAwareInterval(1).pipe(
		mergeMap(() => {
			const id = EntityId();
			return [
				CreateEntityAction(id),
				AttachComponentAction(id, PhysicsComponent(Point2((Math.random() * 306 + 106) | 0, 25), Circle(0, 0, (Math.random() * 12.5 + 2.5) | 0), { density: (Math.random() * 40 + 10) | 0, elasticity: ((Math.random() * 100) | 0) / 100 }))
			];
		})
	)
);

const deadPhysicsEntities = createEntitiesStateFilter(["PhysicsComponent"], (component: PhysicsComponent) => component.position.y > 1000);

const restingPhysicsEntities = createEntitiesStateFilter(["PhysicsComponent"], (component: PhysicsComponent) => component.restingTime > 1);

export const postprocess = (state: GameState): {
	readonly state: GameState;
	readonly actions: ReadonlyArray<GameAction>;
} => ({
	state: {
		...state,
		effects: []
	},
	actions: state.effects.concat(Array.from(deadPhysicsEntities(state)).concat(Array.from(restingPhysicsEntities(state))).map(entity =>  DestroyEntityAction(entity)))
});
