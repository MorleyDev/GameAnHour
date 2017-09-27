import "./Object.pipe";

import * as tape from "tape";

import { pipe } from "./Object.pipe.func";

tape("core/extensions/Object.pipe", test => {
	test.equal(pipe.call({ x: 10 }, function (this: any) { return this.x; }), 10);
	test.equal(pipe.call({ x: 10 }, function (a: any) { return a.x; }), 10);
	test.end();
});

tape("core/extensions/Object.prototype.pipe", test => {
	test.equal({ x: 10 }.pipe(a => a.x), 10);
	test.equal({ x: "10" }.pipe(a => a.x.toString()), "10");
	test.equal({ x: "10" }.pipe(function (this: any) { return this.x.toString(); }), "10");
	test.end();
});
