import { Point2Type } from "./point.model.type";

export function getTopLeft(..._points: Point2Type[]): Point2Type {
	return {
		x:  Math.min(..._points.map(point => point.x)),
		y: Math.min(..._points.map(point => point.y))
	};
}

export function getTopRight(..._points: Point2Type[]): Point2Type {
	return {
		x:  Math.max(..._points.map(point => point.x)),
		y: Math.min(..._points.map(point => point.y))
	};
}

export function getBottomLeft(..._points: Point2Type[]): Point2Type {
	return {
		x:  Math.max(..._points.map(point => point.x)),
		y: Math.min(..._points.map(point => point.y))
	};
}

export function getBottomRight(..._points: Point2Type[]): Point2Type {
	return {
		x:  Math.max(..._points.map(point => point.x)),
		y: Math.max(..._points.map(point => point.y))
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
