import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Seconds } from "../../core/models/time.model";
import { EntitiesState } from "../../entity-component/entities.state";
import { physicsCollisionTick } from "./physics-collision.tick";
import { physicsIntegrationTick } from "./physics-integrate.tick";

export const physicsTick = (tick$: Observable<{ state: EntitiesState; deltaTime: Seconds; }>) => merge(
	physicsIntegrationTick(tick$),
	physicsCollisionTick(tick$)
);
