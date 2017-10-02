import { Clear, Frame } from "../../functional/frame.model";
import { GameRender } from "./game-render.type";

export const gameRender: GameRender = state => Frame(Clear);
