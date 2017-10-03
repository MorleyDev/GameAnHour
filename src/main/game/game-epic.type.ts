import { GenericAction } from "../../functional/generic.action";
import { GameState } from "./game-state.type";
import { Observable } from "rxjs/Observable";

import { GameAction } from "./game-action.type";

export type GameEpic = (action$: Observable<GameAction>, state: () => GameState) => Observable<GameAction>;
