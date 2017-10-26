import { Body, Engine } from "matter-js";
import { Observable } from "rxjs/Observable";
import { interval } from "rxjs/observable/interval";
import { merge } from "rxjs/observable/merge";
import { bufferTime, map, mergeMap } from "rxjs/operators";

import { MouseButton } from "../pauper/core/models/mouse-button.model";
import { Circle } from "../pauper/core/models/shapes.model";
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

const physicsPreReducer = createEntityReducer<GameState>(["PhysicsComponent"], (state, action, physics: PhysicsComponent) => {
	Body.setAngle(physics._body!, physics.rotation);
	Body.setPosition(physics._body!, physics.position);
	Body.setVelocity(physics._body!, physics.velocity);
	Body.setAngularVelocity(physics._body!, physics.angularVelocity);
	physics._body!.restitution = physics.elasticity;

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
	action.type !== "@@TICK" && console.log(action);
	switch (action.type) {
		case "@@TICK":
			const newState = physicsPreReducer(state, action);
			const result = updateEngine(engine, action.deltaTime);
			const postState = physicsPostReducer(newState, action);
			return {
				...postState,
				effects: postState.effects
					.concat(result.collisionStart.map(collision => ({ type: "@@COLLISION_START", collision } as GameAction)))
					.concat(result.collisionEnd.map(collision => ({ type: "@@COLLISION_END", collision } as GameAction)))
			};
		default:
			return entityComponentReducer(state, action);
	}
};

const entityRenderer = createEntitiesStateMap(["PhysicsComponent"], (id: string, physics: PhysicsComponent) => {
	return Origin(physics.position, [
		Rotate(physics.rotation, [
			Fill(physics.shape, "white")
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
	...staticEntityRenderer(state),
	...sensorEntityRenderer(state)
];

export const epic = (action$: Observable<GameAction>, drivers: AppDrivers) => merge<GameAction>(
	interval(15).pipe(map(() => ({ type: "@@TICK", deltaTime: 0.015 }))),
	drivers.mouse!.mouseUp(MouseButton.Left).pipe(
		mergeMap(pos => {
			const id = EntityId();
			return [
				CreateEntityAction(id),
				AttachComponentAction(id, PhysicsComponent(pos, Circle(0, 0, 15), { elasticity: 0.75 }))
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
