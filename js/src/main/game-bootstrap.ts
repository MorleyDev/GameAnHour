import { AttachComponentAction, CreateEntityAction } from "@morleydev/pauper/ecs/entity-component.actions";

import { AppDrivers } from "@morleydev/pauper/app-drivers";
import { BaseComponent } from "@morleydev/pauper/ecs/component-base.type";
import { Circle } from "@morleydev/pauper/models/circle/circle.model";
import { EntityId } from "@morleydev/pauper/ecs/entity-base.type";
import { GameAction } from "./game-action";
import { HardBodyComponent } from "@morleydev/pauper/physics/component/HardBodyComponent";
import { Observable } from "rxjs/Observable";
import { Point2 } from "@morleydev/pauper/models/point/point.model";
import { Rectangle } from "@morleydev/pauper/models/rectangle/rectangle.model";
import { StaticBodyComponent } from "@morleydev/pauper/physics/component/StaticBodyComponent";
import { delay } from "rxjs/operators";
import { from } from "rxjs/observable/from";

const createEntity = (components: ReadonlyArray<BaseComponent>): ReadonlyArray<GameAction> => {
	const id = EntityId();
	const createAction: GameAction[] = [CreateEntityAction(id)];
	const attachActions: GameAction[] = components.map(c => AttachComponentAction(id, c));
	return createAction.concat(attachActions);
};

export function bootstrap(drivers: AppDrivers): Observable<GameAction> {
	return from([
		...createEntity([HardBodyComponent(Point2(0, 0), Circle(0, 0, 25), { elasticity: 1 })]),
		...createEntity([StaticBodyComponent(Point2(250, 0), Rectangle(0, -250, 10, 500))]),
		...createEntity([StaticBodyComponent(Point2(-250, 0), Rectangle(-10, -250, 10, 500))]),
		...createEntity([StaticBodyComponent(Point2(0, 250), Rectangle(-250, 0, 500, 10))]),
		...createEntity([StaticBodyComponent(Point2(0, -250), Rectangle(-250, -10, 500, 10))])
	]).pipe(
		delay(0)
	);
}
