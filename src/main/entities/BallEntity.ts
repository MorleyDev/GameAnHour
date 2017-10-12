import { Vector2 } from "../../pauper/core/maths/vector.maths";
import { Circle } from "../../pauper/core/models/circle/circle.model";
import { Point2 } from "../../pauper/core/models/point/point.model";
import { EntityId } from "../../pauper/entity-component/entity-base.type";
import { AttachComponentAction, CreateEntityAction } from "../../pauper/entity-component/entity-component.actions";
import { CreatePositionComponent } from "../components/PositionComponent";
import { CreateRenderComponent } from "../components/RenderComponent";
import { CreateShapeComponent } from "../components/ShapeComponent";
import { CreateVelocityComponent } from "../components/VelocityComponent";

export const CreateBallEntityActions = () => {
	const entityId = "Ball" + EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, { name: "Ball" }),
		AttachComponentAction(entityId, CreatePositionComponent(Point2(0, 200))),
		AttachComponentAction(entityId, CreateShapeComponent(Circle(0, 0, 10))),
		AttachComponentAction(entityId, CreateVelocityComponent(Vector2(0, 0))),
		AttachComponentAction(entityId, CreateRenderComponent("white"))
	];
};
