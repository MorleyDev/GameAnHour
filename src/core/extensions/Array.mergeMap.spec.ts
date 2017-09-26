import { mergeMap } from "./Array.mergeMap.func";
import * as tape from "tape";

tape("core/extensions/Array.mergeMap", test => {
	test.deepEqual(
		mergeMap.call(([10, 20, 30]), (v: number, i: number, h: number[]) => [v, v * 2, i, h]),
		[10, 20, 0, [10, 20, 30], 20, 40, 1, [10, 20, 30], 30, 60, 2, [10, 20, 30]]
);
	test.end();
});
