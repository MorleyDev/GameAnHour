import { Shape2 } from "../../pauper/core/models/shapes.model";

export type ShapeComponent = {
	readonly name: "ShapeComponent";
	readonly shape: Shape2;
};
export const ShapeComponent: "ShapeComponent" = "ShapeComponent";

export const CreateShapeComponent = (shape: Shape2): ShapeComponent => ({ name: "ShapeComponent", shape });
