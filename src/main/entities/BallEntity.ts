import { Circle } from "../../pauper/core/models/circle/circle.model";
import { Point2 } from "../../pauper/core/models/point/point.model";
import { EntityId } from "../../pauper/entity-component/entity-base.type";
import { AttachComponentAction, CreateEntityAction } from "../../pauper/entity-component/entity-component.actions";
import { CreatePositionComponent } from "../components/PositionComponent";
import { CreateRenderComponent } from "../components/RenderComponent";
import { CreateShapeComponent } from "../components/ShapeComponent";

export const CreateBallEntityActions = () => {
	const entityId = EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, CreatePositionComponent(Point2(0, 200))),
		AttachComponentAction(entityId, CreateShapeComponent(Circle(0, 0, 10))),
		AttachComponentAction(entityId, CreateRenderComponent("white"))
	];
};
