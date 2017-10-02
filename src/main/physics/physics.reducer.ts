import { GameAction } from "../game/game-action.type";
import { GameState } from "../game/game-state.type";
import { physicsIntegrateState } from "./physics-integrate-state.func";
import { PhysicsAction } from "./physics.actions";

export function physicsReducer(state: GameState, action: GameAction): GameState {
	switch (action.type) {
		case PhysicsAction.AdvancePhysicsAction:
			return physicsIntegrateState(state, action.deltaTime);
		default:
			return state;
	}
}
