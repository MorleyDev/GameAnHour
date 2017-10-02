import { GameAction } from "./GameAction";
import { Observable } from "rxjs/Observable";
import { GameState } from "./GameState";
import { Seconds } from "../core/models/time.model";

type UpdateTick = (state: Observable<{ deltaTime: Seconds, state: GameState }>) => Observable<GameAction>;

export const mainUpdateTicks: UpdateTick[] = [];
