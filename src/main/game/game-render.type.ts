import { FrameCollection } from "../../functional/render-frame.model";
import { GameState } from "./game-state.type";

export type GameRender = (state: GameState) => FrameCollection;
