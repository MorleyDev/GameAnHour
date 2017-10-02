import { FrameCollection } from "../../functional/frame.model";
import { GameState } from "./game-state.type";

export type GameRender = (state: GameState) => FrameCollection;
