import { entityComponentRender } from "../../entity-component/entity-component.render";
import { Clear, Frame } from "../../functional/render-frame.model";
import { GameRender } from "./game-render.type";

export const gameRender: GameRender = state => Frame(
	Clear,
	entityComponentRender(state)
);
