import { mergeMap } from "./Array.mergeMap.func";
import * as tape from "tape";

tape("core/extensions/Array.mergeMap", test => {
	const result = mergeMap.call(([10, 20, 30]), (v: number) => [v, v * 2]);

	test.deepEqual(result, [10, 20, 20, 40, 30, 60]);
	test.end();
});
