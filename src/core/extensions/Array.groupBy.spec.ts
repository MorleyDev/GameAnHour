import { groupBy } from "./Array.groupBy.func";
import * as tape from "tape";

tape("core/extensions/Array.groupBy", test => {
	test.deepEqual(
		groupBy.call((["abc", "cde", "acb", "bcd"]), (v: string, i: number, h: string[]) => v.charAt(0)),
		{
			"a": ["abc", "acb"],
			"b": ["bcd"],
			"c": ["cde"]
		}
	);
	test.end();
});

tape("core/extensions/Array.prototype.groupBy", test => {
	test.deepEqual(
		["abc", "cde", "acb", "bcd"].groupBy((v: string, i: number, h: string[]) => v.charAt(0)),
		{
			"a": ["abc", "acb"],
			"b": ["bcd"],
			"c": ["cde"]
		}
	);
	test.deepEqual(
		["abc", "cde", "acb", "bcd"].groupBy((v: string, i: number, h: string[]) => v.charAt(0) === "a" ? 0 : 1),
		{
			[0]: ["abc", "acb"],
			[1]: ["cde", "bcd"]
		}
	);

	enum TestEnum { One, Two };
	test.deepEqual(
		["abc", "cde", "acb", "bcd"].groupBy((v: string, i: number, h: string[]) => v.charAt(0) === "a" ? TestEnum.One : TestEnum.Two),
		{
			[TestEnum.One]: ["abc", "acb"],
			[TestEnum.Two]: ["cde", "bcd"]
		}
	);
	test.end();
});
