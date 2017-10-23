import { MouseButton } from "../pauper/core/models/mouseButton";
import { interval } from "rxjs/observable/interval";
import { Rectangle } from "../pauper/core/models/shapes.model";
import { createEntitiesStateMap, entityComponentReducer } from "../pauper/entity-component";
import { EntityId } from "../pauper/entity-component/entity-base.type";
import { AttachComponentAction, CreateEntityAction } from "../pauper/entity-component/entity-component.actions";
import { map, mergeMap } from "rxjs/operators";
import { PhysicsComponent } from "./components/PhysicsComponent";
import { createEntityReducer } from "../pauper/entity-component/create-entity-reducer.func";

import { Engine } from "matter-js";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { AppDrivers } from "../pauper/functional/app-drivers";
import { Clear, Origin, Rotate, Stroke } from "../pauper/functional/render-frame.model";
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
		Rotate(-physics.rotation, [
			Stroke(Rectangle(physics.position.x, physics.position.y, 40, 40), "white")
		])
	]);
});

export const render = (state: GameState) => [
	Clear("black"),
	Array.from( entityRenderer(state) )
];

export const epic = (action$: Observable<GameAction>, drivers: AppDrivers) => merge(
	interval(10).pipe( map(() => ({ type: "@@TICK", deltaTime: 0.01 }))),
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
		mergeMap(pos => {
			const id = EntityId();
			return [
				CreateEntityAction(id),
				AttachComponentAction(id, PhysicsComponent(pos, true))
			];
		})
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
