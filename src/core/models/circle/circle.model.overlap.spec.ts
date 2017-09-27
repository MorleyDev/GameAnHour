import { Point2Type } from "../point/point.model.type";
import { CircleType } from "./circle.model.type";
import { overlaps } from "./circle.model.overlap";
import * as tape from "tape";

tape("core/models/circle/circle.model.overlap.spec", test => {
	test.test("circle overlaps circle", test => {
		const should = (a: CircleType, b: CircleType) => test.true(overlaps(a, b), `(${a.x},${a.y})r${a.radius}) should overlap (${b.x},${b.y})r${b.radius})`);
		const shouldNot = (a: CircleType, b: CircleType) => test.false(overlaps(a, b), `(${a.x},${a.y})r${a.radius}) should not overlap (${b.x},${b.y})r${b.radius})`);

		should({ x: 10, y: 12, radius: 5 }, { x: 17, y: 15, radius: 8 });
		should({ x: 17, y: 15, radius: 8 }, { x: 10, y: 12, radius: 5 });
		should({ x: 10, y: 5, radius: 10 }, { x: 30, y: 5, radius: 10 });
		should({ x: 5, y: 10, radius: 5 }, { x: 5, y: 25, radius: 10 });
		shouldNot({ x: 10, y: 10, radius: 5 }, { x: 40, y: 20, radius: 3 });
		shouldNot({ x: 40, y: 20, radius: 3 }, { x: 10, y: 10, radius: 5 });

		test.end();
	});
	test.test("circle overlaps point", test => {
		const should = (a: CircleType, b: Point2Type) => test.true(overlaps(a, b), `(${a.x},${a.y})r${a.radius}) should overlap (${b.x},${b.y}))`);
		const shouldNot = (a: CircleType, b: Point2Type) => test.false(overlaps(a, b), `(${a.x},${a.y})r${a.radius}) should not overlap (${b.x},${b.y}))`);

		should({ x: 10, y: 12, radius: 5 }, { x: 12, y: 15 });
		should({ x: 17, y: 15, radius: 8 }, { x: 10, y: 12 });
		should({ x: 10, y: 5, radius: 10 }, { x: 20, y: 5 });
		should({ x: 5, y: 10, radius: 5 }, { x: 5, y: 15, });
		shouldNot({ x: 10, y: 10, radius: 5 }, { x: 40, y: 20, });
		shouldNot({ x: 10, y: 10, radius: 5 }, { x: 10, y: 16, });
		shouldNot({ x: 10, y: 10, radius: 5 }, { x: 16, y: 10, });
		shouldNot({ x: 10, y: 10, radius: 5 }, { x: 4, y: 10, });
		shouldNot({ x: 10, y: 10, radius: 5 }, { x: 10, y: 4, });

		test.end();
	});
	test.end();
});
