import { Observable } from "rxjs/Observable";

import { Seconds } from "../../core/models/time.model";
import { AdvancePhysicsAction } from "./physics.actions";
import { PhysicsState } from "./physics.state";

export const physicsIntegrationTick = (tick$: Observable<{ state: PhysicsState, deltaTime: Seconds }>) =>
	tick$.filter(({ state }) => state.physics.integrationEnabled).map(({ state, deltaTime }) => AdvancePhysicsAction(deltaTime));
