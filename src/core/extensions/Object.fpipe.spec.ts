import "./Object.fpipe";

import * as tape from "tape";

import { fpipe } from "./Object.fpipe.func";

tape("core/extensions/Object.fpipe", test => {
	test.equal(fpipe.call({ x: 10 }, function (this: any) { return this.x; }), 10);
	test.equal(fpipe.call({ x: 10 }, function (this: any, x: number) { return this.x + x; }, 20), 30);
	test.end();
});

tape("core/extensions/Object.prototype.fpipe", test => {
	test.equal({ x: "10" }.fpipe(function () { return this.x.toString(); }), "10");
	test.equal({ x: "10" }.fpipe(function (x) { return this.x.toString() + x.toString(); }, 20), "1020");
	test.end();
});
