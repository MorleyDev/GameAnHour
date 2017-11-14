import { BaseComponent } from "./component-base.type";
import { EntitiesState } from "./entities.state";
import { EntityId } from "./entity-base.type";

export function getEntitiesByComponents(withComponents: ReadonlyArray<string>): (state: EntitiesState) => Iterable<EntityId> {
	return function * (state: EntitiesState): Iterable<EntityId> {
		for (const entityId in state.entities) {
			let contin = false;
			for (const component of withComponents) {
				if (!(state.componentEntityLinks[component] || []).includes(entityId)) {
					contin = true;
					break;
				}
			}
			if (contin) {
				continue;
			}
			yield entityId;
		}
	};
}
