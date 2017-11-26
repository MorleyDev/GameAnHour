import "@babel/polyfill";

import { render } from "../../main/game-render";
import { GameState } from "../../main/game.model";
import { profile, statDump } from "@morleydev/pauper/profiler";
import { worker } from "@morleydev/pauper/engine/engine";

type WorkerEvent = {
	readonly type: "RenderStateToFrame";
	readonly state: GameState;
	readonly timestamp: number;
};

const renderer = render();

worker.receive$.subscribe((event: string): void => {
	const workerEvent: WorkerEvent = JSON.parse(event);
	const frame = profile("Render::State->Frame", () => renderer(workerEvent.state));
	const outbound = JSON.stringify({ type: "RenderFrame", frame, timestamp: workerEvent.timestamp });
	worker.send(outbound);
});

worker.onJoin((name: string): void => {
	statDump(name);
});
