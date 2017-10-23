import { test } from "tap";

import { hasValue, Just, match, Maybe, None, withDefault } from "./maybe";

/* tslint:disable */

test("functional/maybe", test => {
	test.test("withDefault :: Just X -> X", test => {
		const justX: Maybe<number> = Just(10) as Maybe<number>;
		const value = withDefault(justX, () => 20);
		test.equal(value, 10);
		test.end();
	});
	test.test("withDefault :: None -> X", test => {
		const none: Maybe<number> = None as Maybe<number>;
		const value = withDefault(none, () => 20);
		test.equal(value, 20);
		test.end();
	});
	test.test("hasValue :: Just X -> true", test => {
		const justX: Maybe<number> = Just(25) as Maybe<number>;
		test.equal(hasValue(justX), true);
		if (hasValue(justX)) {
			test.equal(justX.value, 25);
		}
		test.end();
	});
	test.test("hasValue :: None -> false", test => {
		const none: Maybe<number> = None as Maybe<number>;
		const value = hasValue(none);
		test.equal(value, false);
		test.end();
	});
	test.test("match :: (Just X) (X -> Y) (Unit -> Z) -> Y", test => {
		const justX: Maybe<number> = Just(25) as Maybe<number>;
		const result = match(justX, x => x.toString(), () => 0);
		test.equal(result, "25");
		test.end();
	});
	test.test("match :: (Just X) (X -> Y) (Unit -> Z) -> Z", test => {
		const none: Maybe<string> = None as Maybe<string>;
		const result = match(none, x => parseInt(x), () => "458");
		test.equal(result, "458");
		test.end();
	});
	test.end();
});
