import "@babel/polyfill";

import { render } from "../../main/game-render";
import { GameState } from "../../main/game.model";
import { profile, statDump } from "../../pauper/profiler";

type WorkerEvent = {
	readonly type: "RenderStateToFrame";
	readonly state: GameState;
	readonly timestamp: number;
};

const renderer = render();

WORKER_Receive = (event: string): void => {
	const workerEvent: WorkerEvent = JSON.parse(event);
	const frame = profile("Render::State->Frame", () => renderer(workerEvent.state));
	const outbound = JSON.stringify({ type: "RenderFrame", frame, timestamp: workerEvent.timestamp });
	WORKER_Emit(outbound);
};

WORKER_Join = (name: string): void => {
	statDump(name);
};
