import "./Array.zip";

import * as tape from "tape";

import { zip } from "./Array.zip.func";

tape("core/extensions/Array.zip", test => {
	test.deepEqual(zip.call(([10, 20, 30]), [20, 30, 40]), [[10, 20], [20, 30], [30, 40]]);
	test.deepEqual(zip.call(([10, 20]), [20, 30, 40]), [[10, 20], [20, 30]]);
	test.deepEqual(zip.call(([10, 20, 30]), [20, 30]), [[10, 20], [20, 30]]);
	test.deepEqual(zip.call(([10, 20, 30]), []), []);
	test.deepEqual(zip.call(([]), [10, 20, 30]), []);
	test.deepEqual(zip.call(([]), []), []);
	test.deepEqual(zip.call(([10, 20, 30]), ["20", "30", "40"]), [[10, "20"], [20, "30"], [30, "40"]]);
	test.end();
});

tape("core/extensions/Array.prototype.zip", test => {
	test.deepEqual([10, 20, 30].zip([20, 30, 40]), [[10, 20], [20, 30], [30, 40]]);
	test.deepEqual([10, 20].zip([20, 30, 40]), [[10, 20], [20, 30]]);
	test.deepEqual([10, 20, 30].zip([20, 30]), [[10, 20], [20, 30]]);
	test.deepEqual([10, 20, 30].zip([]), []);
	test.deepEqual([].zip([10, 20, 30]), []);
	test.deepEqual([].zip([]), []);
	test.deepEqual([10, 20, 30].zip(["20", "30", "40"]), [[10, "20"], [20, "30"], [30, "40"]]);
	test.end();
});
