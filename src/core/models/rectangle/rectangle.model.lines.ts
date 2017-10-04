import { Line2Type } from "../line/line.model.type";
import { boundingTLBR } from "./rectangle.model.bounding";
import { RectangleType } from "./rectangle.model.type";

export function lines(rectangle: RectangleType): { readonly top: Line2Type; readonly left: Line2Type; readonly bottom: Line2Type; readonly right: Line2Type } {
	const bounding = boundingTLBR(rectangle);

	return {
		top: [bounding.topLeft, { x: bounding.bottomRight.x, y: bounding.topLeft.y }],
		left: [bounding.topLeft, { x: bounding.topLeft.x, y: bounding.bottomRight.y }],
		bottom: [ { x: bounding.topLeft.x, y: bounding.bottomRight.y }, bounding.bottomRight],
		right: [ { x: bounding.bottomRight.x, y: bounding.topLeft.y }, bounding.bottomRight]
	};
}
