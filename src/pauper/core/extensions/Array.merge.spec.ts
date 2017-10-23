import "./Array.merge";

import { test } from "tap";

import { merge } from "./Array.merge.func";

/* tslint:disable */
test("core/extensions/Array.merge", test => {
	const result = merge.call(([[10, 20], [], [40, 30], [60, [50]]]));

	test.deepEqual(result, [10, 20, 40, 30, 60, [50]]);
	test.end();
});

test("core/extensions/Array.prototype.merge", test => {
	const result = [[10, 20], [], [40, 30], [60, [50]]].merge();

	test.deepEqual(result, [10, 20, 40, 30, 60, [50]]);
	test.end();
});
