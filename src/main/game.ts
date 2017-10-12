import { PositionComponent } from "./components/PositionComponent";
import { RenderComponent } from "./components/RenderComponent";
import { ShapeComponent } from "./components/ShapeComponent";
import { createReducer } from "../pauper/functional/create-reducer.func";
import { TickAction } from "../pauper/functional/system-tick.action";
import { rotate2d } from "../pauper/core/maths/angles.maths";
import { BaseComponent } from "../pauper/entity-component/component-base.type";
import { createEntityReducer } from "../pauper/entity-component/create-entity-reducer.func";
import { EntityId } from "../pauper/entity-component/entity-base.type";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";

import { Circle, Point2, Shape2 } from "../pauper/core/models/shapes.model";
import { entityComponentReducer, createEntitiesStateMap } from "../pauper/entity-component";
import { Clear, Fill, FrameCollection, Origin } from "../pauper/functional/render-frame.model";
import { GameAction, GameState } from "./game.model";

export const reducer = (state: GameState, action: GameAction) => state
	.pipe(entityComponentReducer, action);

const renderShapes = createEntitiesStateMap(
	[PositionComponent, ShapeComponent, RenderComponent],
	(_: EntityId, position: PositionComponent, shape: ShapeComponent, render: RenderComponent) => 
	Fill(Shape2.add(shape.shape, position.position), render.colour)
);

export const render = (state: GameState) => [
	Clear,
	Origin(Point2(320, 240), [
		...renderShapes(state)
	])
];

export const epic = (action$: Observable<GameAction>) => merge();
