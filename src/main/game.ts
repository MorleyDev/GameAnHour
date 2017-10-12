import { createReducer } from "../pauper/functional/create-reducer.func";
import { TickAction } from "../pauper/functional/system-tick.action";
import { rotate2d } from "../pauper/core/maths/angles.maths";
import { BaseComponent } from "../pauper/entity-component/component-base.type";
import { createEntityReducer } from "../pauper/entity-component/create-entity-reducer.func";
import { EntityId } from "../pauper/entity-component/entity-base.type";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Circle, Point2 } from "../pauper/core/models/shapes.model";
import { entityComponentReducer, createEntitiesStateMap } from "../pauper/entity-component";
import { Clear, Fill, FrameCollection, Origin } from "../pauper/functional/render-frame.model";
import { GameAction, GameState } from "./game.model";

const rotator = createReducer(
	["@@TICK", createEntityReducer(
	["POSITION", "ROTATE"],
	(state: GameState, action: TickAction, position: { name: string; position: Point2 }, rotate: BaseComponent) => [
		{ ...position, position: rotate2d(position.position, action.deltaTime) },
		rotate
	])]
);

export const reducer = (state: GameState, action: GameAction) => state
	.pipe(entityComponentReducer, action)
	.pipe(rotator, action);

const renderPositionedSimple = createEntitiesStateMap(
	["POSITION", "RENDER_SIMPLE"],
	(entityId: EntityId, { position }: { position: Point2 }, { render }: { render: () => FrameCollection }) => {
		return Origin(position, [
			render()
		]);
	}
);

export const render = (state: GameState) => [
	Clear,
	Origin(Point2(320, 240), [
		Fill(Circle(0, 0, 100), "red"),
		...renderPositionedSimple(state)
	])
];

export const epic = (action$: Observable<GameAction>) => merge();
