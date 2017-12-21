import "@babel/polyfill";

import { engine, secondary } from "@morleydev/pauper/engine/engine";

import { statDump } from "@morleydev/pauper/profiler";

secondary.onJoin((name: string): void => statDump(name));

engine.hotreload.onStash(() => "");
engine.hotreload.receive$.subscribe((state: string) => { });
