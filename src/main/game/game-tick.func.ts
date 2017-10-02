import { empty } from "rxjs/observable/empty";

import { GameTick } from "./game-tick.type";

export const gameTick: GameTick = tick$ => empty();
