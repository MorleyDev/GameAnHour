import { Point2 } from "../../pauper/core/models/point/point.model";

export type PositionComponent = { name: "PositionComponent"; position: Point2; };
export const PositionComponent: "PositionComponent" = "PositionComponent";

export const CreatePositionComponent = (position: Point2): PositionComponent => ({ name: PositionComponent, position });
