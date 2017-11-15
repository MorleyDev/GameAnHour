import "@babel/polyfill";

import { statDump } from "../../pauper/profiler";

SECONDARY_Receive = (event: string): void => {
};

SECONDARY_Join = (name: string): void => {
	statDump(name);
};
