import { BaseComponent } from "../pauper/entity-component/component-base.type";
import { Engine } from "matter-js";
import { Observable } from "rxjs/Observable";
import { interval } from "rxjs/observable/interval";
import { merge } from "rxjs/observable/merge";
import { map, mergeMap, tap } from "rxjs/operators";

import { MouseButton } from "../pauper/core/models/mouse-button.model";
import { Rectangle } from "../pauper/core/models/shapes.model";
import { createEntitiesStateMap, entityComponentReducer } from "../pauper/entity-component";
import { createEntitiesStateFilter } from "../pauper/entity-component/create-entities-state-filter.func";
import { createEntityReducer } from "../pauper/entity-component/create-entity-reducer.func";
import { EntityId } from "../pauper/entity-component/entity-base.type";
import { AttachComponentAction, CreateEntityAction, DestroyEntityAction } from "../pauper/entity-component/entity-component.actions";
import { AppDrivers } from "../pauper/functional/app-drivers";
import { Clear, Origin, Rotate, Stroke } from "../pauper/functional/render-frame.model";
import { PhysicsComponent } from "./components/PhysicsComponent";
import { GameAction, GameState } from "./game.model";
import { engine } from "./physics-engine";

const physicsReducer = createEntityReducer<GameState>(["PhysicsComponent"], (state, action, physics: PhysicsComponent) => {
	return [{
		...physics,
		position: { x: physics._body!.position.x + 20, y: physics._body!.position.y + 20 },
		rotation: physics._body!.angle
	}];
});

export const reducer = (state: GameState, action: GameAction): GameState => {
	switch (action.type) {
		case "@@TICK":
			Engine.update(engine, action.deltaTime * 1000);
			return physicsReducer(state, action);
		default:
			return entityComponentReducer(state, action);
	}
};

const entityRenderer = createEntitiesStateMap(["PhysicsComponent"], (id: string, physics: PhysicsComponent) => {
	return Origin(physics.position, [
		Rotate(physics.rotation, [
			Stroke(Rectangle(-20, -20, 40, 40), "white")
		])
	]);
});

export const render = (state: GameState) => [
	Clear("black"),
	Array.from(entityRenderer(state))
];

export const epic = (action$: Observable<GameAction>, drivers: AppDrivers) => merge<GameAction>(
	interval(10).pipe(map(() => ({ type: "@@TICK", deltaTime: 0.01 }))),
	drivers.mouse!.mouseUp(MouseButton.Left).pipe(
		mergeMap(pos => {
			const id = EntityId();
			return [
				CreateEntityAction(id),
				AttachComponentAction(id, PhysicsComponent(pos, false))
			];
		})
	),
	drivers.mouse!.mouseUp(MouseButton.Right).pipe(
		tap(console.log),
		mergeMap(pos => {
			const id = EntityId();
			return [
				CreateEntityAction(id),
				AttachComponentAction(id, PhysicsComponent(pos, true))
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
