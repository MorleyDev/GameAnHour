import { flatten } from "./Array.flatten.func";
import * as tape from "tape";

tape("core/extensions/Array.flatten", test => {
	const result = flatten.call(([[10, 20], [], [40, 30], [60, [50]]]));

	test.deepEqual(result, [10, 20, 40, 30, 60, [50]]);
	test.end();
});
