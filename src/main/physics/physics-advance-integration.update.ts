import { PhysicsAdvanceIntegrationAction } from "./physics-advance-integration.action";
import { PhysicsState } from "./physics-state";
import { Observable } from "rxjs/Observable";
import { GenericAction } from "../../functional/generic.action";
import { Seconds } from "../../core/models/time.model";

export const applyPhysicsAdvanceIntegration = <TState extends PhysicsState>(tick$: Observable<{ deltaTime: Seconds; state: TState }>): Observable<GenericAction> => {
	return tick$
		.filter(({ state }) => state.physics.integrator.enabled)
		.map(({ deltaTime }) => PhysicsAdvanceIntegrationAction(deltaTime));
}
