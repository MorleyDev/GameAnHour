import { Point2 } from "../pauper/core/models/shapes.model";
import { Circle } from "../pauper/core/models/circle/circle.model";
import { merge } from "rxjs/observable/merge";
import { of as of$ } from "rxjs/observable/of";

import { EntityId } from "../pauper/entity-component/entity-base.type";
import { AttachComponentAction, CreateEntityAction } from "../pauper/entity-component/entity-component.actions";
import { Fill } from "../pauper/functional/render-frame.model";

const createBall$ = of$(EntityId())
	.mergeMap(entityId => [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, {
			name: "RENDER_SIMPLE", render: () => [
				Fill(Circle(0, 0, 10), "blue")
			]
		}),
		AttachComponentAction(entityId, {
			name: "POSITION", position: Point2(-100, 100)
		}),
		AttachComponentAction(entityId, {
			name: "ROTATE"
		})
	]);

export const bootstrap = merge(
	createBall$
);
