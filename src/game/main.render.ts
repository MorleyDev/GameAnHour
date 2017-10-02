import { Clear, Frame, FrameCollection } from "../functional/frame.model";
import { GameState } from "./GameState";

export const mainRender = (state: GameState): FrameCollection => Frame(
	Clear
);
