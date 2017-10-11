import { Line2Type } from "./line.model.type";
import { intersects } from "./line.model.intersect";
import * as tape from "tape";

tape("core/models/line/line.model.intersect.spec", test => {
	const make = (x1: number, y1: number, x2: number, y2: number): Line2Type => [{ x: x1, y: y1 }, { x: x2, y: y2 }];

	const should = (a: Line2Type, b: Line2Type) => test.true(
		intersects(a, b),
		`(${a[0].x}, ${a[0].y})-(${a[1].x}, ${a[1].y}) should intersect (${b[0].x}, ${b[0].y})-(${b[1].x}, ${b[1].y})`
	);

	const shouldNot = (a: Line2Type, b: Line2Type) => test.false(
		intersects(a, b),
		`(${a[0].x}, ${a[0].y})-(${a[1].x}, ${a[1].y}) should not intersect (${b[0].x}, ${b[0].y})-(${b[1].x}, ${b[1].y})`
	);

	should(make(10, 10, 20, 20), make(20, 20, 10, 10));
	should(make(10, 10, 20, 20), make(15, 20, 15, 5));
	should(make(10, 10, 20, 20), make(15, 20, 15, 15));
	should(make(10, 10, 20, 20), make(5, 15, 20, 15));

	shouldNot(make(10, 10, 20, 20), make(25, 25, 30, 30));
	shouldNot(make(10, 0, 20, 0), make(10, 5, 20, 5));
	shouldNot(make(0, 10, 0, 20), make(5, 10, 5, 20));

	test.end();
});
