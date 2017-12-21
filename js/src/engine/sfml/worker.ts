import "@babel/polyfill";

import { worker } from "@morleydev/pauper/engine/engine";

worker.receive$.subscribe((event: string): void => {
});
