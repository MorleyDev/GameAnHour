import * as tape from "tape";

import { merge } from "./Array.merge.func";

tape("core/extensions/Array.merge", test => {
	const result = merge.call(([[10, 20], [], [40, 30], [60, [50]]]));

	test.deepEqual(result, [10, 20, 40, 30, 60, [50]]);
	test.end();
});