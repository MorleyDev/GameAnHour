import { fmergeMap } from "../core/extensions/Array.mergeMap.func";
import { Observable } from "rxjs/Observable";
import { mergeMap } from "rxjs/operator/mergeMap";

import { fcall } from "../core/extensions/Object.fcall.func";
import { GenericAction } from "../functional/generic.action";
import { EntitiesState } from "./entities.state";

export const entityComponentEpic = (action$: Observable<GenericAction>, getState: () => EntitiesState) => {
	function transformAction(action: GenericAction): ReadonlyArray<GenericAction> {
		const entities = getState().entities;
		const transformables = entities.mergeMap(([_, self]) => self.components.filter(c => c.transform).map(c => ({ c, self })))
		const actions = fmergeMap(transformables, (({ self, c }) => c.transform!(self, action)));
		return actions;
	}
	return fcall(action$, mergeMap, transformAction) as Observable<GenericAction>;
};
