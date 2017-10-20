import { Point2 } from "../../pauper/core/models/point/point.model";

export type PositionComponent = {
	readonly name: "PositionComponent";
	readonly position: Point2;
};
export const PositionComponent: "PositionComponent" = "PositionComponent";

export const CreatePositionComponent = (position: Point2): PositionComponent => ({ name: PositionComponent, position });
