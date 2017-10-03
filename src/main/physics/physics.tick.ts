import { merge } from "rxjs/observable/merge";

import { GameTick } from "../game/game-tick.type";
import { physicsCollisionTick } from "./physics-collision.tick";
import { physicsIntegrationTick } from "./physics-integrate.tick";

export const physicsTick: GameTick = tick$ => merge(
	physicsIntegrationTick(tick$),
	physicsCollisionTick(tick$)
);
