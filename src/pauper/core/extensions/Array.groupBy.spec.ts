import "./Array.groupBy";

import { test } from "tap";

import { groupBy } from "./Array.groupBy.func";

/* tslint:disable */
test("core/extensions/Array.groupBy", test => {
	test.deepEqual(
		groupBy.call((["abc", "cde", "acb", "bcd"]), (v: string, i: number, h: string[]) => v.charAt(0)),
		{
			"a": ["abc", "acb"],
			"b": ["bcd"],
			"c": ["cde"]
		}
	);
	test.deepEqual(
		groupBy.call((["abc", "cde", "acb", "bcd"]), (v: string, i: number, h: string[]) => v.charAt(0), (v: string) => v.charAt(1)),
		{
			"a": ["b", "c"],
			"b": ["c"],
			"c": ["d"]
		}
	);
	test.end();
});

test("core/extensions/Array.prototype.groupBy", test => {
	test.deepEqual(
		["abc", "cde", "acb", "bcd"].groupBy((v: string, i: number, h: ReadonlyArray<string>) => v.charAt(0)),
		{
			"a": ["abc", "acb"],
			"b": ["bcd"],
			"c": ["cde"]
		}
	);
	test.deepEqual(
		["abc", "cde", "acb", "bcd"].groupBy((v: string, i: number, h: ReadonlyArray<string>) => v.charAt(0) === "a" ? 0 : 1),
		{
			[0]: ["abc", "acb"],
			[1]: ["cde", "bcd"]
		}
	);

	enum TestEnum { One, Two }
	test.deepEqual(
		["abc", "cde", "acb", "bcd"].groupBy((v: string, i: number, h: ReadonlyArray<string>) => v.charAt(0) === "a" ? TestEnum.One : TestEnum.Two),
		{
			[TestEnum.One]: ["abc", "acb"],
			[TestEnum.Two]: ["cde", "bcd"]
		}
	);
	test.end();
});
