import { Observable } from "rxjs/Observable";

import { GameAction } from "../game/game-action.type";
import { GameState } from "../game/game-state.type";

export const entityComponentEpic = (action$: Observable<GameAction>, getState: () => GameState) => action$
	.mergeMap(action => {
		const state = getState();
		return state.entities
			.mergeMap(self => self.components
				.filter(component => component.transform != null)
				.mergeMap(component => component.transform!({ self, state }, action))
			);
	});
