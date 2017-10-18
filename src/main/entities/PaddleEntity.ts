import { Vector2 } from "../../pauper/core/maths/vector.maths";
import { CreateVelocityComponent } from "../components/VelocityComponent";
import { CreateRenderComponent } from "../components/RenderComponent";
import { Rectangle } from "../../pauper/core/models/rectangle/rectangle.model";
import { CreateShapeComponent } from "../components/ShapeComponent";
import { Point2 } from "../../pauper/core/models/point/point.model";
import { CreatePositionComponent } from "../components/PositionComponent";
import { EntityId } from "../../pauper/entity-component/entity-base.type";
import { AttachComponentAction, CreateEntityAction } from "../../pauper/entity-component/entity-component.actions";

export const CreatePaddleEntityActions = () => {
	const entityId = "Paddle" + EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, { name: "Paddle" }),
		AttachComponentAction(entityId, CreatePositionComponent(Point2(0, 220))),
		AttachComponentAction(entityId, CreateVelocityComponent(Vector2(0, 0))),
		AttachComponentAction(entityId, CreateShapeComponent(Rectangle(-20, -5, 40, 10))),
		AttachComponentAction(entityId, CreateRenderComponent("red"))
	];
};
