import { Observable } from "rxjs/Observable";

import { Seconds } from "../core/models/time.model";
import { GenericAction } from "../functional/generic.action";
import { EntitiesState } from "./entities.state";
import { Entity } from "./entity.type";

export const entityComponentTick = (tick$: Observable<{ state: EntitiesState; deltaTime: Seconds; }>) => tick$.mergeMap(tickState);

function tickEntity(self: Entity, { state, deltaTime }: { state: any; deltaTime: Seconds }): GenericAction[] {
	return self.components
		.filter(c => c.tick != null)
		.mergeMap(c => c.tick!({ self, state }, deltaTime));
}

function tickState({ state, deltaTime }: { state: EntitiesState; deltaTime: Seconds }): GenericAction[] {
	return state.entities.map(([_, self]) => tickEntity(self, { state, deltaTime })).merge();
}
