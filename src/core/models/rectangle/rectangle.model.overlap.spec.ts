import { RectangleType } from "./rectangle.model.type";
import { overlaps } from "./rectangle.model.overlap";
import * as tape from "tape";

tape("core/models/rectangle/rectangle.model.overlap.spec", test => {
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
