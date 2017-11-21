import { map } from "@morleydev/functional-pipe/iterable/operators";

import { Point2Type } from "./point.model.type";

export function getTopLeft(..._points: Point2Type[]): Point2Type {
	return {
		x:  Math.min(...map((point: Point2Type) => point.x)(_points)),
		y: Math.min(...map((point: Point2Type) => point.y)(_points)),
	};
}

export function getTopRight(..._points: Point2Type[]): Point2Type {
	return {
		x:  Math.max(...map((point: Point2Type) => point.x)(_points)),
		y: Math.min(...map((point: Point2Type) => point.y)(_points)),
	};
}

export function getBottomLeft(..._points: Point2Type[]): Point2Type {
	return {
		x:  Math.max(...map((point: Point2Type) => point.x)(_points)),
		y: Math.min(...map((point: Point2Type) => point.y)(_points)),
	};
}

export function getBottomRight(..._points: Point2Type[]): Point2Type {
	return {
		x:  Math.max(...map((point: Point2Type) => point.x)(_points)),
		y: Math.max(...map((point: Point2Type) => point.y)(_points)),
	};
}

export function getCentre(..._points: Point2Type[]): Point2Type {
	const tl = getTopLeft(..._points);
	const br = getBottomRight(..._points);
	return {
		x: tl.x + (br.x - tl.x) / 2,
		y: tl.y + (br.y - tl.y) / 2
	};
}
