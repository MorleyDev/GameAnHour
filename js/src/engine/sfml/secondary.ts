import "@babel/polyfill";

import { Observable } from "rxjs/Observable";
import { auditTime, distinctUntilChanged, scan, switchMap, tap } from "rxjs/operators";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { Subject } from "rxjs/Subject";

import { postprocess, reducer } from "../../main/game-reducer";
import { GameAction, GameState } from "../../main/game.model";
import { getLogicalScheduler, PhysicsDrivers, SchedulerDrivers } from "../../pauper/app-drivers";
import { SubjectKeyboard } from "../../pauper/input/SubjectKeyboard";
import { SubjectMouse } from "../../pauper/input/SubjectMouse";
import { box2dPhysicsEcsEvents, box2dPhysicsReducer } from "../../pauper/physics/_inner/box2dEngine";
import { profile, statDump } from "../../pauper/profiler";
import { safeBufferTime } from "../../pauper/rx-operators/safeBufferTime";
import { async } from "rxjs/scheduler/async";

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
			SECONDARY_Emit(JSON.stringify(action));
			return action;
		})
		.reduce(applyAction, newState);
};
SECONDARY_Receive = (event: string): void => {
	const e: { type: "state"; state: GameState } | { type: "action"; action: GameAction } = JSON.parse(event);
	if (e.type === "state") {
		states.next(e.state);
	} else {
		actions.next(e.action);
	}
};

let prevState: GameState | null = null;
const sub = states.pipe(
	switchMap(initialState => actions.pipe(
		scan(applyAction, initialState),
		auditTime(drivers.framerates.logicalRender, getLogicalScheduler(drivers as SchedulerDrivers)),
		tap(currentState => {
			if (prevState !== currentState) {
				WORKER_Emit(JSON.stringify({ type: "RenderStateToFrame", state: currentState, timestamp: Date.now() }));
				prevState = currentState;
			}
		})
	))
).subscribe(() => {
});

SECONDARY_Join = (name: string): void => {
	sub.unsubscribe();
	statDump(name);
};
