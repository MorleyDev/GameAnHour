import { merge } from "rxjs/observable/merge";

import { entityComponentTick } from "../ec/entity-component.tick";
import { GameTick } from "./game-tick.type";

export const gameTick: GameTick = tick$ => merge(
	entityComponentTick(tick$)
);
