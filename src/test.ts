import "core-js";

import { readdirSync, statSync } from "fs";
import { join } from "path";
import * as tape from "tape";

tape(
	"Unit tests",
	tape => importTestsIn(__dirname)
		.catch(err => tape.error(err))
		.then(() => tape.end())
);

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
