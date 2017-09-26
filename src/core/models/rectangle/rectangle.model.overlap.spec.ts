import { overlaps } from "./rectangle.model.overlap";
import * as tape from "tape";

tape("core/models/rectangle/rectangle.model.overlap.spec", test => {
	test.true(overlaps({ x: 25, y: 12, width: 5, height: 3 }, { x: 17, y: 15, width: 8, height: 10 }));
	test.false(overlaps({ x: 25, y: 12, width: 5, height: 3 }, { x: 7, y: 15, width: 8, height: 10 }));
	test.end();
});
