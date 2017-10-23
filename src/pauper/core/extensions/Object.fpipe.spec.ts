import "./Object.fpipe";

import { test } from "tap";

import { fpipe } from "./Object.fpipe.func";

/* tslint:disable */

test("core/extensions/Object.fpipe", test => {
	test.equal(fpipe({ x: 10 }, function (a: any) { return a.x; }), 10);
	test.equal(fpipe({ x: 10 }, function (a: any, x: number) { return a.x + x; }, 20), 30);
	test.equal(fpipe({ x: 10 }, function (this: any) { return this == null; }), true);
	test.end();
});

test("core/extensions/Object.prototype.fpipe", test => {
	test.equal({ x: 10 }.fpipe(a => a.x), 10);
	test.equal({ x: "10" }.fpipe(a => a.x.toString()), "10");
	test.equal({ x: "10" }.fpipe((a, b) => a.x.toString() + b.toString(), 20), "1020");
	test.equal({ x: "10" }.fpipe(function () { return this == null; }), true);
	test.end();
});
