import { Observable } from "rxjs/Observable";

import { GameAction } from "./game-action.type";

export type GameEpic = (action$: Observable<GameAction>) => Observable<GameAction>;
