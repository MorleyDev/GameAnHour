import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Vector2 } from "../core/maths/vector.maths";
import { Circle } from "../core/models/shapes.model";
import { entityComponentReducer } from "../entity-component/entity-component.reducer";
import { Clear, Fill, Origin, Scale } from "../functional/render-frame.model";
import { GameState } from "./game-initial-state";
import { GameAction } from "./game-models";

export const reducer = (state: GameState, action: GameAction) => state
	.pipe(entityComponentReducer, action);

export const render = (state: GameState) => [
	Clear,
	Origin({ x: 320, y: 240 }, [
		Scale(Vector2(320, 240), [
		])
	])
];

export const epic = (action$: Observable<GameAction>) => merge();
