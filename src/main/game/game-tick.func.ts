import { merge } from "rxjs/observable/merge";

import { entityComponentTick } from "../../entity-component/entity-component.tick";
import { physicsTick } from "../physics/physics.tick";
import { GameTick } from "./game-tick.type";

export const gameTick: GameTick = tick$ => merge(
	physicsTick(tick$),
	entityComponentTick(tick$)
);
