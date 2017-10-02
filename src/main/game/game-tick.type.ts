import { Observable } from "rxjs/Observable";

import { Seconds } from "../../core/models/time.model";
import { GameAction } from "./game-action.type";
import { GameState } from "./game-state.type";

export type GameTick = (tick$: Observable<{ deltaTime: Seconds, state: GameState }>) => Observable<GameAction>;
