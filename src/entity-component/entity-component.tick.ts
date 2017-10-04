import { Observable } from "rxjs/Observable";
import { mergeMap } from "rxjs/operator/mergeMap";

import { merge } from "../core/extensions/Array.merge.func";
import { fmergeMap } from "../core/extensions/Array.mergeMap.func";
import { fcall } from "../core/extensions/Object.fcall.func";
import { Seconds } from "../core/models/time.model";
import { GenericAction } from "../functional/generic.action";
import { Component } from "./component.type";
import { EntitiesState } from "./entities.state";
import { Entity } from "./entity.type";

export const entityComponentTick = (tick$: Observable<{ state: EntitiesState; deltaTime: Seconds; }>): Observable<GenericAction> => {
	function tickComponent(entity: Entity, deltaTime: Seconds): (c: Component) => ReadonlyArray<GenericAction> {
		return (c: Component) => c.tick!(entity, deltaTime);
	}

	function tickEntity(self: Entity, deltaTime: Seconds): ReadonlyArray<GenericAction> {
		const tickables = self.components.filter(([_, c]) => c.tick != null).map(t => t[1]);
		const result = fmergeMap(tickables, tickComponent(self, deltaTime));
		return result;
	}

	function tickState({ state, deltaTime }: { state: EntitiesState; deltaTime: Seconds }): ReadonlyArray<GenericAction> {
		const tickedActions = state.entities.map(([_, self]) => tickEntity(self, deltaTime));
		return fcall(tickedActions, merge) as any as ReadonlyArray<GenericAction>;
	}

	return fcall(tick$, mergeMap, tickState) as Observable<GenericAction>;
};
