import { Observable } from "rxjs/Observable";

import { GameAction } from "../game/game-action.type";
import { GameState } from "../game/game-state.type";

export const entityComponentEpic = (action$: Observable<GameAction>, getState: () => GameState) => action$
	.mergeMap(action => {
		const state = getState();

		return state.entities
			.mergeMap(([_, self]) => self.components.filter(c => c.transform).map(c => ({ c, self })))
			.mergeMap(({ self, c }) => c.transform!({ state, self }, action));
	});
