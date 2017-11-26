import "@babel/polyfill";

import { Observable } from "rxjs/Observable";
import { auditTime, distinctUntilChanged, scan, switchMap, tap } from "rxjs/operators";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { async } from "rxjs/scheduler/async";
import { Subject } from "rxjs/Subject";

import { postprocess, reducer } from "../../main/game-reducer";
import { GameAction, GameState } from "../../main/game.model";
import { getLogicalScheduler, PhysicsDrivers, SchedulerDrivers } from "@morleydev/pauper/app-drivers";
import { SubjectKeyboard } from "@morleydev/pauper/input/SubjectKeyboard";
import { SubjectMouse } from "@morleydev/pauper/input/SubjectMouse";
import { box2dPhysicsEcsEvents, box2dPhysicsReducer } from "@morleydev/pauper/physics/_inner/box2dEngine";
import { profile, statDump } from "@morleydev/pauper/profiler";
import { safeBufferTime } from "@morleydev/pauper/rx-operators/safeBufferTime";
import { secondary, worker, engine } from "@morleydev/pauper/engine/engine";

const states = new ReplaySubject<GameState>(1);
const actions = new Subject<GameAction>();

const drivers = {
	keyboard: new SubjectKeyboard(),
	mouse: new SubjectMouse(),
	framerates: {
		logicalRender: 20,
		logicalTick: 20
	},
	physics: {
		events: box2dPhysicsEcsEvents,
		reducer: box2dPhysicsReducer
	},
	schedulers: {
		logical: async,
		graphics: async
	}
};

const fastScan: (reducer: (state: GameState, action: GameAction) => GameState, initialState: GameState) => (input: Observable<GameAction>) => Observable<GameState> =
	(reducer, initialState) => {
		const applyAction = (state: GameState, action: GameAction): GameState => {
			return profile(action.type, () => reducer(state, action));
		};
		const applyActions = (state: GameState, actions: ReadonlyArray<GameAction>) => actions.reduce(applyAction, state);

		return self => self.pipe(
			safeBufferTime(drivers.framerates.logicalTick),
			scan(applyActions, initialState),
			distinctUntilChanged()
		);
	};

const gameReducer = reducer(drivers as PhysicsDrivers);

const applyAction = (state: GameState, action: GameAction): GameState => {
	const nexGameState = gameReducer(state, action);
	const { state: newState, actions: followup } = postprocess(nexGameState);
	return followup
		.map((action: GameAction) => {
			secondary.send(JSON.stringify(action));
			return action;
		})
		.reduce(applyAction, newState);
};
secondary.receive$.subscribe((event: string): void => {
	const e: { type: "state"; state: GameState } | { type: "action"; action: GameAction } = JSON.parse(event);
	if (e.type === "state") {
		states.next(e.state);
	} else {
		actions.next(e.action);
	}
});

let prevState: GameState | null = null;
const sub = states.pipe(
	switchMap(initialState => actions.pipe(
		scan(applyAction, initialState),
		auditTime(drivers.framerates.logicalRender, getLogicalScheduler(drivers as SchedulerDrivers)),
		tap(currentState => {
			if (prevState !== currentState) {
				worker.send(JSON.stringify({ type: "RenderStateToFrame", state: currentState, timestamp: Date.now() }));
				prevState = currentState;
			}
		})
	))
).subscribe(() => {
});

secondary.onJoin((name: string): void => {
	sub.unsubscribe();
	statDump(name);
});

engine.hotreload.onStash(() => JSON.stringify(prevState));
engine.hotreload.receive$.subscribe((state: string) => {
	const gameState: GameState | null = JSON.parse(state);
	if (gameState != null) {
		states.next(gameState);
	}
});
