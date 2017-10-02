import { entityComponentReducer } from "../ec/entity-component.reducer";
import { GameReducer } from "./game-reducer.type";

export const gameReducer: GameReducer = (state, action) => state.pipe(entityComponentReducer, action);
