import { lengthOf } from "./line.model.length";
import { Line2Type } from "./line.model.type";
import { intersects } from "./line.model.intersect";
import * as tape from "tape";

tape("core/models/line/line.model.length.spec", test => {
	const make = (x1: number, y1: number, x2: number, y2: number): Line2Type => [{ x: x1, y: y1 }, { x: x2, y: y2 }];

	const within = (test: tape.Test, low: number, high: number) =>
	(value: number) =>
		test.true(
			value >= low && value <= high,
			`${value} should be between ${low} and ${high}`
		);

	within(test, 182.48, 182.49)(lengthOf(make(200, 20, 20, 50)));
	within(test, 91.24, 91.25)(lengthOf(make(100, 20, 10, 5)));

	test.equal(lengthOf(make(2, 20, 30, 20)), 28);
	test.equal(lengthOf(make(5, 20, 0, 20)), 5);
	test.equal(lengthOf(make(10, 20, 10, 35)), 15);
	test.equal(lengthOf(make(10, 45, 10, 10)), 35);

	test.end();
});
