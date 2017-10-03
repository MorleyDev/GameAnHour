import { merge } from "rxjs/observable/merge";

import { entityComponentEpic } from "../../entity-component/entity-component.epic";
import { GameEpic } from "./game-epic.type";

export const gameEpic: GameEpic = (action$, state) => merge(
	entityComponentEpic(action$, state)
);
