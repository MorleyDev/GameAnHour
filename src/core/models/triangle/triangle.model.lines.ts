import { Line2Type } from "../line/line.model.type";
import { Triangle2Type } from "./triangle.model.type";

export function lines(lhs: Triangle2Type): [Line2Type, Line2Type, Line2Type] {
	return  [
		[lhs[0], lhs[1]],
		[lhs[1], lhs[2]],
		[lhs[2], lhs[0]]
	];
}
