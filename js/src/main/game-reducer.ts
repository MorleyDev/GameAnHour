import { PhysicsDrivers } from "../pauper/app-drivers";
import { createEntityComponentReducer } from "../pauper/ecs/entity-component.reducer";
import { GameAction, GameState } from "./game.model";

export const reducer = (drivers: PhysicsDrivers) => {
	const physicsReducer = drivers.physics.reducer<GameState, GameAction>((state, result) => ({
		...state,
		effects: state.effects
			.concat(result.collisionStarts.map(collision => ({ type: "@@COLLISION_START", collision } as GameAction)))
			.concat(result.collisionEnds.map(collision => ({ type: "@@COLLISION_END", collision } as GameAction)))
	}));

	const entityComponentReducer = createEntityComponentReducer(drivers.physics.events);

	return (state: GameState, action: GameAction): GameState => {
		switch (action.type) {
			case "@@TICK":
				return {
					...state,
					runtime: state.runtime + action.deltaTime,
					effects: state.effects
				};

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
