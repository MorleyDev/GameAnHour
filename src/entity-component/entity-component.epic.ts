import { Observable } from "rxjs/Observable";
import { mergeMap } from "rxjs/operator/mergeMap";

import { fmerge } from "../core/extensions/Array.merge.func";
import { fmergeMap } from "../core/extensions/Array.mergeMap.func";
import { fcall } from "../core/extensions/Object.fcall.func";
import { GenericAction } from "../functional/generic.action";
import { EntitiesState } from "./entities.state";
import { EntityId } from "./entity-base.type";
import { EntityFilteredAction } from "./entity-component.actions";

export const entityComponentEpic = (action$: Observable<GenericAction>, getState: () => EntitiesState) => {
	function transformAction(action: GenericAction & Partial<EntityFilteredAction>): ReadonlyArray<GenericAction> {
		const entities = getState().entities;
		const targetEntities = action.targetEntities != null
			? action.targetEntities.map(entity => entities.at(entity)!)
			: entities.map(([_, entity]) => entity);

		return fmergeMap(
			targetEntities,
			entity => fmerge(
					entity.components
						.filter(([_, c]) => c.transform != null)
						.map(([_, c]) => c.transform!(entity, action))
				)
			);
	}
	return fcall(action$, mergeMap, transformAction) as Observable<GenericAction>;
};
