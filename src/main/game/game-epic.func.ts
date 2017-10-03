import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { entityComponentEpic } from "../../entity-component/entity-component.epic";
import { GameAction } from "./game-action.type";
import { GameEpic } from "./game-epic.type";

export const gameEpic: GameEpic = (action$, state) => merge(
	entityComponentEpic(action$, state) as Observable<GameAction>
);
