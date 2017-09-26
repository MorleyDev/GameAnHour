import { Point2Type } from "./point.model.type";

export function getTopLeft(...points: Point2Type[]): Point2Type {
	return {
		x:  Math.min(...points.map(point => point.x)),
		y: Math.min(...points.map(point => point.y))
	};
}

export function getTopRight(...points: Point2Type[]): Point2Type {
	return {
		x:  Math.max(...points.map(point => point.x)),
		y: Math.min(...points.map(point => point.y))
	};
}

export function getBottomLeft(...points: Point2Type[]): Point2Type {
	return {
		x:  Math.max(...points.map(point => point.x)),
		y: Math.min(...points.map(point => point.y))
	};
}

export function getBottomRight(...points: Point2Type[]): Point2Type {
	return {
		x:  Math.max(...points.map(point => point.x)),
		y: Math.max(...points.map(point => point.y))
	};
}
