import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Seconds } from "../../core/models/time.model";
import { physicsCollisionTick } from "./physics-collision.tick";
import { physicsIntegrationTick } from "./physics-integrate.tick";
import { PhysicsState } from "./physics.state";

export const physicsTick = (tick$: Observable<{ state: PhysicsState; deltaTime: Seconds; }>) => merge(
	physicsIntegrationTick(tick$),
	physicsCollisionTick(tick$)
);
