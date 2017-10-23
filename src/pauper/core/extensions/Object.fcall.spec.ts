import "./Object.fcall";

import { test } from "tap";

import { fcall } from "./Object.fcall.func";

/* tslint:disable */

test("core/extensions/Object.fcall", test => {
	test.equal(fcall({ x: 10 }, function (this: any) { return this.x; }), 10);
	test.equal(fcall({ x: 10 }, function (this: any, x: number) { return this.x + x; }, 20), 30);
	test.end();
});

test("core/extensions/Object.prototype.fcall", test => {
	test.equal({ x: "10" }.fcall(function () { return this.x.toString(); }), "10");
	test.equal({ x: "10" }.fcall(function (x) { return this.x.toString() + x.toString(); }, 20), "1020");
	test.end();
});
