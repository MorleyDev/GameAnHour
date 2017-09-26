import { overlaps } from "./circle.model.overlap";
import * as tape from "tape";

tape("core/models/circle/circle.model.overlap.spec", test => {
	test.true(overlaps({ x: 10, y: 12, radius: 5 }, { x: 17, y: 15, radius: 8 }));
	test.false(overlaps({ x: 10, y: 10, radius: 5 }, { x: 40, y: 20, radius: 3 }));
	test.end();
});
