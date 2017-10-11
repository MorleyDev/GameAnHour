import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Circle, Point2 } from "../pauper/core/models/shapes.model";
import { entityComponentReducer } from "../pauper/entity-component";
import { Clear, Fill, Origin } from "../pauper/functional/render-frame.model";
import { GameAction, GameState } from "./game.model";

export const reducer = (state: GameState, action: GameAction) => state
	.pipe(entityComponentReducer, action);

export const render = (state: GameState) => [
	Clear,
	Origin(Point2(320, 240), [
		Fill(Circle(0, 0, 100), "red")
	])
];

export const epic = (action$: Observable<GameAction>) => merge();
