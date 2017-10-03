import { Observable } from "rxjs/Observable";

import { GenericAction } from "../functional/generic.action";
import { EntitiesState } from "./entities.state";

export const entityComponentEpic = (action$: Observable<GenericAction>, getState: () => EntitiesState) => action$
	.mergeMap(action => {
		const state = getState();

		return state.entities
			.mergeMap(([_, self]) => self.components.filter(c => c.transform).map(c => ({ c, self })))
			.mergeMap(({ self, c }) => c.transform!({ state, self }, action));
	});
