import { $$ } from "@morleydev/functional-pipe";
import { AppDrivers } from "@morleydev/pauper/app-drivers";
import { GameAction } from "./game-action";
import { GameState } from "./game-state";
import { createEntityComponentReducer } from "@morleydev/pauper/ecs/entity-component.reducer";

export function createReducer(drivers: AppDrivers): (state: GameState, action: GameAction) => GameState {
	const entityComponentReducer = createEntityComponentReducer(drivers.physics.events);
	const physicsReducer = drivers.physics.reducer((state, collisions) => state);
	const logicalReducer = (state: GameState, action: GameAction) => state;

	return (state: GameState, action: any) =>
		$$(state)
			.$(state => physicsReducer(state, action))
			.$(state => entityComponentReducer(state, action))
			.$$(state => logicalReducer(state, action));
}
