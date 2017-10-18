import "./Object.fpipe";

import * as tape from "tape";

import { fpipe } from "./Object.fpipe.func";

tape("core/extensions/Object.fpipe", test => {
	test.equal(fpipe({ x: 10 }, function (a: any) { return a.x; }), 10);
	test.equal(fpipe({ x: 10 }, function (a: any, x: number) { return a.x + x; }, 20), 30);
	test.equal(fpipe({ x: 10 }, function (this: any) { return this == null; }), true);
	test.end();
});

tape("core/extensions/Object.prototype.fpipe", test => {
	test.equal({ x: 10 }.fpipe(a => a.x), 10);
	test.equal({ x: "10" }.fpipe(a => a.x.toString()), "10");
	test.equal({ x: "10" }.fpipe((a, b) => a.x.toString() + b.toString(), 20), "1020");
	test.equal({ x: "10" }.fpipe(function () { return this == null; }), true);
	test.end();
});
