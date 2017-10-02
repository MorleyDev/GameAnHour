import { Entity } from "./entity.type";
import { GameAction } from "../game/game-action.type";
import { Seconds } from "../../core/models/time.model";
import { GameState } from "../game/game-state.type";
import { GameTick } from "../game/game-tick.type";

export const entityComponentTick: GameTick = tick$ => tick$.mergeMap(tickState);

function tickEntity(self: Entity, { state, deltaTime }: { state: GameState; deltaTime: Seconds }): GameAction[] {
	return self.components
		.filter(c => c.tick != null)
		.mergeMap(c => c.tick!({ self, state }, deltaTime));
}

function tickState({ state, deltaTime }: { state: GameState; deltaTime: Seconds }): GameAction[] {
	return state.entities.mergeMap(self => tickEntity(self, { state, deltaTime }));
}
