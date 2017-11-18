import { RGBA } from "../pauper/models/colour.model";
import { Clear } from "../pauper/render/render-frame.model";
import { GameState } from "./game.model";

export const render = () => {
	return (state: GameState) => [
		Clear(RGBA(0, 0, 0))
	];
};
