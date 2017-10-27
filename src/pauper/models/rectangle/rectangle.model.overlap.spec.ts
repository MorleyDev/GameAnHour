import { test } from "tap";

import { CircleType } from "../circle/circle.model.type";
import { Point2Type } from "../point/point.model.type";
import { overlaps } from "./rectangle.model.overlap";
import { RectangleType } from "./rectangle.model.type";

/* tslint:disable */

test("core/models/rectangle/rectangle.model.overlap.spec", test => {
	test.test("rectangle overlaps rectangle", test => {
		const should = (a: RectangleType, b: RectangleType) => test.true(
			overlaps(a, b),
			`(${a.x}, ${a.y}, ${a.width}w ${a.height}h) should overlap (${b.x}, ${b.y}, ${b.width}w ${b.height}h)`
		);
		const shouldNot = (a: RectangleType, b: RectangleType) => test.false(
			overlaps(a, b),
			`(${a.x}, ${a.y}, ${a.width}w ${a.height}h) should not overlap (${b.x}, ${b.y}, ${b.width}w ${b.height}h)`
		);
		should({ x: 25, y: 12, width: 5, height: 3 }, { x: 17, y: 15, width: 8, height: 10 });
		shouldNot({ x: 25, y: 12, width: 5, height: 3 }, { x: 7, y: 15, width: 8, height: 10 });
		test.end();
	});
	test.test("rectangle overlaps point", test => {
		const should = (a: RectangleType, b: Point2Type) => test.true(
			overlaps(a, b),
			`(${a.x}, ${a.y}, ${a.width}w ${a.height}h) should overlap (${b.x}, ${b.y})`
		);
		const shouldNot = (a: RectangleType, b: Point2Type) => test.false(
			overlaps(a, b),
			`(${a.x}, ${a.y}, ${a.width}w ${a.height}h) should not overlap (${b.x}, ${b.y})`
		);

		should({ x: 25, y: 12, width: 5, height: 3 }, { x: 30, y: 13 });
		should({ x: 25, y: 12, width: 5, height: 3 }, { x: 26, y: 15 });
		should({ x: 25, y: 12, width: 5, height: 3 }, { x: 25, y: 12 });
		should({ x: 25, y: 12, width: 5, height: 3 }, { x: 25, y: 13 });
		should({ x: 25, y: 12, width: 5, height: 3 }, { x: 26, y: 12 });

		shouldNot({ x: 25, y: 12, width: 5, height: 3 }, { x: 0, y: 13 });
		shouldNot({ x: 25, y: 12, width: 5, height: 3 }, { x: 13, y: 0 });
		shouldNot({ x: 25, y: 12, width: 5, height: 3 }, { x: 31, y: 13 });
		shouldNot({ x: 25, y: 12, width: 5, height: 3 }, { x: 28, y: 16 });

		test.end();
	});
	test.test("rectangle overlaps circle", test => {
		const should = (a: RectangleType, b: CircleType) => test.true(overlaps(a, b), `(${a.x},${a.y})${a.width}w${a.height}h should overlap (${b.x},${b.y})r${b.radius}`);
		const shouldNot = (a: RectangleType, b: CircleType) => test.false(overlaps(a, b), `(${a.x},${a.y})${a.width}w${a.height}h should not overlap (${b.x},${b.y})r${b.radius}`);

		// Above
		should({ x: 12, y: 15, width: 10, height: 5 }, { x: 15, y: 10, radius: 5 });
		shouldNot({ x: 12, y: 15, width: 10, height: 5 }, { x: 15, y: 9, radius: 5 });

		// Left of
		should({ x: 15, y: 8, width: 10, height: 15 }, { x: 10, y: 10, radius: 5 });
		shouldNot({ x: 15, y: 8, width: 10, height: 15 }, { x: 9, y: 10, radius: 5 });

		// Right of
		should({ x: 15, y: 8, width: 10, height: 15 }, { x: 30, y: 10, radius: 5 });
		shouldNot({ x: 15, y: 8, width: 10, height: 15 }, { x: 31, y: 10, radius: 5 });

		// Below
		should({ x: 12, y: 15, width: 10, height: 5 }, { x: 15, y: 25, radius: 5 });
		shouldNot({ x: 12, y: 15, width: 10, height: 5 }, { x: 15, y: 26, radius: 5 });

		test.end();
	});
	test.end();
});
