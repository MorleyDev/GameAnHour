import { intersect } from "./Array.intersect.func";
import * as tape from "tape";

tape("core/extensions/Array.intersect.func", test => {
	test.deepEqual([...intersect([4, 5, 6, 1, 2, 3], [2, 3, 4, 5], [1, 2, 3, 4], [3, 2, 1, 4])].sort(), [2, 3, 4]);
	test.deepEqual([...intersect(["4", "5", "6", "1", "2", "3"], ["2", "3", "4", "5"], ["1", "2", "3", "4"], ["3", "2", "1", "4"])].sort(), ["2", "3", "4"]);
	test.deepEqual([...intersect([])], []);
	test.end();
});
