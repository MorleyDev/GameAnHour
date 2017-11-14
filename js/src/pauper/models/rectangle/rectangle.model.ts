import * as bounding from "./rectangle.model.bounding";
import * as is from "./rectangle.model.is";
import * as lines from "./rectangle.model.lines";
import * as lineTo from "./rectangle.model.lineTo";
import * as overlaps from "./rectangle.model.overlap";
import * as tlbr from "./rectangle.model.tlbr";
import { RectangleType } from "./rectangle.model.type";

export type Rectangle = RectangleType;

export const Rectangle = Object.assign(
	(x: number, y: number, width: number, height: number): Rectangle => ({ x, y, width, height }),
	{
		...bounding,
		...tlbr,
		...is,
		...overlaps,
		...lineTo,
		...lines
	}
);
