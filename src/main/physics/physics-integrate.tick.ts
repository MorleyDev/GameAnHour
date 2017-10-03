import { Observable } from "rxjs/Observable";

import { Seconds } from "../../core/models/time.model";
import { EntitiesState } from "../../entity-component/entities.state";
import { AdvancePhysicsAction } from "./physics.actions";

export const physicsIntegrationTick = (tick$: Observable<{ state: EntitiesState, deltaTime: Seconds }>) =>
	tick$.map(({ state, deltaTime }) => AdvancePhysicsAction(deltaTime));
