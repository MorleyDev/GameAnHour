import { List } from "immutable";
import { Engine } from "matter-js";
import { Observable } from "rxjs/Observable";
import { interval } from "rxjs/observable/interval";
import { merge } from "rxjs/observable/merge";
import { filter, map, mergeMap } from "rxjs/operators";

import { Key } from "../pauper/core/models/keys.model";
import { MouseButton } from "../pauper/core/models/mouse-button.model";
import { Circle, Point2 } from "../pauper/core/models/shapes.model";
import { Text2 } from "../pauper/core/models/text/text.model";
import { Triangle2 } from "../pauper/core/models/triangle/triangle.model";
import { createEntitiesStateMap, entityComponentReducer } from "../pauper/entity-component";
import { createEntitiesStateFilter } from "../pauper/entity-component/create-entities-state-filter.func";
import { createEntityReducer } from "../pauper/entity-component/create-entity-reducer.func";
import { EntityId } from "../pauper/entity-component/entity-base.type";
import { AttachComponentAction, CreateEntityAction, DestroyEntityAction } from "../pauper/entity-component/entity-component.actions";
import { destroyEntity } from "../pauper/entity-component/entity-component.reducer";
import { AppDrivers } from "../pauper/functional/app-drivers";
import { Clear, Fill, Origin, Rotate } from "../pauper/functional/render-frame.model";
import { PhysicsComponent } from "./components/PhysicsComponent";
import { GameAction, GameState } from "./game.model";
import { engine } from "./physics-engine";
import { StaticPhysicsComponent } from "./components/StaticPhysicsComponent";

const physicsPreReducer = createEntityReducer<GameState>(["PhysicsComponent"], (state, action, physics: PhysicsComponent) => {
	physics._body!.position.x = physics.position.x;
	physics._body!.position.y = physics.position.y;
	physics._body!.angle = physics.rotation;
	return [physics];
});

const physicsPostReducer = createEntityReducer<GameState>(["PhysicsComponent"], (state, action, physics: PhysicsComponent) => {
	return [{
		...physics,
		position: {
			x: physics._body!.position.x,
			y: physics._body!.position.y
		},
		rotation: physics._body!.angle
	}];
});

export const reducer = (state: GameState, action: GameAction): GameState => {
	switch (action.type) {
		case "@@TICK":
			const newState = physicsPreReducer(state, action);
			Engine.update(engine, action.deltaTime * 1000);
			return physicsPostReducer(newState, action);
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

export const render = (state: GameState) => [
	Clear("black"),
	...(entityRenderer(state)),
	...(staticEntityRenderer(state)),
	Fill(Text2(`Active entities ${state.entities.size}`, 20, 20, undefined, "12px", "sans-serif"), "white")
];

export const epic = (action$: Observable<GameAction>, drivers: AppDrivers) => merge<GameAction>(
	interval(15).pipe(map(() => ({ type: "@@TICK", deltaTime: 0.015 }))),
	drivers.mouse!.mouseUp(MouseButton.Left).pipe(
		mergeMap(pos => {
			const id = EntityId();
			return [
				CreateEntityAction(id),
				AttachComponentAction(id, PhysicsComponent(pos, Circle(0, 0, 15)))
			];
		})
	)
);

const deadPhysicsEntities = createEntitiesStateFilter(["PhysicsComponent"], (component: PhysicsComponent) => component.position.y > 1000);

export const postprocess = (state: GameState): {
	readonly state: GameState;
	readonly actions: ReadonlyArray<GameAction>;
} => ({
	state: {
		...state,
		effects: []
	},
	actions: state.effects.concat(Array.from(deadPhysicsEntities(state)).map(entity => DestroyEntityAction(entity)))
});
