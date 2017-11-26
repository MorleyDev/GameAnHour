import { HardBodyComponent } from "@morleydev/pauper/physics/component/HardBodyComponent";
import { PlayerComponent } from "./component/types";
import { PhysicsDrivers } from "@morleydev/pauper/app-drivers";
import { createEntityComponentReducer } from "@morleydev/pauper/ecs/entity-component.reducer";
import { GameAction, GameState, PlayerTryJumpAction } from "./game.model";
import { createEntityReducer } from "@morleydev/pauper/ecs/create-entity-reducer.func";
import { Vector2 } from "@morleydev/pauper/maths/vector.maths";

export const reducer = (drivers: PhysicsDrivers) => {
	const physicsReducer = drivers.physics.reducer<GameState, GameAction>((state, result) => ({
		...state,
		effects: state.effects
			.concat(result.collisionStarts.map(collision => ({ type: "@@COLLISION_START", collision } as GameAction)))
			.concat(result.collisionEnds.map(collision => ({ type: "@@COLLISION_END", collision } as GameAction)))
	}));

	const entityComponentReducer = createEntityComponentReducer(drivers.physics.events);

	const playerTryJumpReducer = createEntityReducer<GameState, PlayerTryJumpAction>(["PlayerComponent", "HardBodyComponent"], (state, action, player: PlayerComponent, body: HardBodyComponent) => [
		player,
		({ ...body, pendingForces: body.pendingForces.concat({ location: body.position, force: Vector2.multiply(Vector2.normalise( Vector2.subtract(body.position, action.position) ), 7.5) }) })
	]);

	return (state: GameState, action: GameAction): GameState => {
		switch (action.type) {
			case "@@TICK":
				return {
					...state,
					runtime: state.runtime + action.deltaTime,
					effects: state.effects
				};

			case "PlayerTryJumpAction":
				return playerTryJumpReducer(state, action);

			case "@@COLLISION_START":
			case "@@COLLISION_END":
				return state;

			default:
				return physicsReducer(entityComponentReducer(state, action), action);
		}
	};
};

export const postprocess = (state: GameState): {
	readonly state: GameState;
	readonly actions: ReadonlyArray<GameAction>;
} => ({
	state: { ...state, effects: [] },
	actions: state.effects
});
