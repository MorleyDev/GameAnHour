import "core-js";
import "./pauper/core/extensions";

import { readdirSync, statSync } from "fs";
import { join } from "path";
import { test } from "tap";

importTestsIn(__dirname);

function importTestsIn(path: string): Promise<any[]> {
	const testFiles = findTestsIn(path);
	const importTests = testFiles.map(testPath => import(testPath));

	return Promise.all(importTests);
}

function findTestsIn(path: string): string[] {
	return readdirSync(path)
		.map(item => join(path, item))
		.map(item => ({ stat: statSync(item), fullpath: item }))
		.map(item => item.stat.isDirectory() ? findTestsIn(item.fullpath) : item.fullpath)
		.map(item => Array.isArray(item) ? item : [item])
		.reduce((prev, curr) => prev.concat(curr), [])
		.filter(item => item.match(/^.+\.spec\.(j|t)sx?$/));
}
