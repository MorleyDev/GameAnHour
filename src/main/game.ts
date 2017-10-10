import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Vector2 } from "../core/maths/vector.maths";
import { entityComponentReducer } from "../entity-component/entity-component.reducer";
import { Clear, Origin, Scale } from "../functional/render-frame.model";
import { GameState, initialState } from "./game-initial-state";
import { GameAction } from "./game-models";

const reducer = (state: GameState, action: GameAction) => state
	.pipe(entityComponentReducer, action);

const render = (state: GameState) => [
	Clear,
	Origin({ x: 320, y: 240 }, [
		Scale(Vector2(320, 240), [
		])
	])
];

const epic = (action$: Observable<GameAction>) => merge();

export const app = { epic, initialState, reducer, render };
