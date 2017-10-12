import { CreateRenderComponent } from "../components/RenderComponent";
import { Rectangle } from "../../pauper/core/models/rectangle/rectangle.model";
import { CreateShapeComponent } from "../components/ShapeComponent";
import { Point2 } from "../../pauper/core/models/point/point.model";
import { CreatePositionComponent } from "../components/PositionComponent";
import { EntityId } from "../../pauper/entity-component/entity-base.type";
import { AttachComponentAction, CreateEntityAction } from "../../pauper/entity-component/entity-component.actions";

export const CreateBlockEntityActions = (x: number, y: number) => {
	const entityId = "Block" + EntityId();
	return [
		CreateEntityAction(entityId),
		AttachComponentAction(entityId, { name: "Block" }),
		AttachComponentAction(entityId, CreatePositionComponent(Point2(x * 50 + 25 - 300, y * 25 + 10 - 200))),
		AttachComponentAction(entityId, CreateShapeComponent(Rectangle(-20, -5, 40, 10))),
		AttachComponentAction(entityId, CreateRenderComponent("lightblue"))
	];
};
