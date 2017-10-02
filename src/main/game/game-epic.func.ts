import { empty } from "rxjs/observable/empty";
import { GameEpic } from "./game-epic.type";

export const gameEpic: GameEpic = action$ => empty();
