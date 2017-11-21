import { test } from "tap";

import { hasValue, Just, match, Maybe, None, toArray, toIterable, withDefault } from "./maybe";

/* tslint:disable */

test("pauper/utility/maybe", test => {
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
		const hasValueResult = hasValue(justX);
		test.equal(hasValue(justX), true);
		test.equal((justX as Just<number>).value, 25);
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
	test.test("match :: (None) (X -> Y) (Unit -> Z) -> Z", test => {
		const none: Maybe<string> = None as Maybe<string>;
		const result = match(none, x => parseInt(x), () => "458");
		test.equal(result, "458");
		test.end();
	});
	test.test("toArray :: (Just X) -> Array<X>", test => {
		const just: Maybe<string> = Just("256");
		test.deepEqual(toArray(just), ["256"]);
		test.end();
	});
	test.test("toArray :: (None) -> Array<X>", test => {
		const none: Maybe<string> = None as Maybe<string>;
		test.deepEqual(toArray(none), []);
		test.end();
	});
	test.test("toIterable :: (Just X) -> Iterable<X>", test => {
		const just: Maybe<string> = Just("256");
		test.deepEqual(Array.from(toIterable(just)), ["256"]);
		test.end();
	});
	test.test("toIterable :: (None) -> Iterable<X>", test => {
		const none: Maybe<string> = None as Maybe<string>;
		test.deepEqual(Array.from(toIterable(none)), []);
		test.end();
	});
	test.end();
});
