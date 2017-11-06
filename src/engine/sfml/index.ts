import { profile, stats } from "../../pauper/profiler";
import "core-js";

import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { of } from "rxjs/observable/of";
import { auditTime, distinctUntilChanged, ignoreElements, reduce, retryWhen, scan, switchMap, tap } from "rxjs/operators";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { Subject } from "rxjs/Subject";

import * as game from "../../main/game";
import { bootstrap } from "../../main/game-bootstrap";
import { initialState } from "../../main/game-initial-state";
import { GameAction, GameState } from "../../main/game.model";
import { AppDrivers, getLogicalScheduler } from "../../pauper/app-drivers";
import { NoOpAssetLoader } from "../../pauper/assets/noop-asset-loader.service";
import { NoOpAudioService } from "../../pauper/audio/noop-audio.service";
import { NoOpKeyboard } from "../../pauper/input/NoOpKeyboard";
import { SubjectMouse } from "../../pauper/input/SubjectMouse";
import { matterJsPhysicsEcsEvents, matterJsPhysicsReducer } from "../../pauper/physics/_inner/matterEngine";
import { FrameCollection } from "../../pauper/render/render-frame.model";
import { renderToSfml } from "../../pauper/render/render-to-sfml.func";
import { safeBufferTime } from "../../pauper/rx-operators/safeBufferTime";

try {
	const drivers = {
		keyboard: new NoOpKeyboard(),
		mouse: new SubjectMouse(),
		audio: new NoOpAudioService(),
		loader: new NoOpAssetLoader(),
		framerates: {
			logicalRender: 20,
			logicalTick: 20
		},
		physics: {
			events: matterJsPhysicsEcsEvents,
			reducer: matterJsPhysicsReducer
		}
	};

	const r = game.reducer(drivers as AppDrivers);
	const g = {
		render: (state: GameState) => game.render(state),
		postprocess: (prev: GameState) => game.postprocess(prev),
		reducer: (prev: GameState, curr: GameAction) => r(prev, curr),
		epic: (actions$: Observable<GameAction>) => game.epic(actions$, drivers as AppDrivers),
		initialState,
		bootstrap: bootstrap,
	};

	const postProcessSubject = new Subject<GameAction>();
	const subject = new Subject<GameAction>();

	const bootstrap$ = g.bootstrap.pipe(
		tap((action: GameAction) => subject.next(action)),
		ignoreElements()
	);

	const epicActions$ = g.epic(merge(subject, postProcessSubject)).pipe(
		tap((action: GameAction) => subject.next(action)),
		ignoreElements()
	);

	const fastScan: (reducer: (state: GameState, action: GameAction) => GameState, initialState: GameState) => (input: Observable<GameAction>) => Observable<GameState> =
		(reducer, initialState) => {
			const applyAction = (state: GameState, action: GameAction): GameState => {
				return profile(action.type, () => reducer(state, action));
			};
			const applyActions = (state: GameState, actions: ReadonlyArray<GameAction>) => actions.reduce(applyAction, state);

			return self => self.pipe(
				safeBufferTime(drivers.framerates.logicalTick, getLogicalScheduler(drivers as AppDrivers)),
				scan(applyActions, initialState),
				distinctUntilChanged()
			);
		};

	const applyAction = (state: GameState, action: GameAction): GameState => {
		const nexGameState = g.reducer(state, action);
		const { state: newState, actions: followup } = g.postprocess(nexGameState);
		return followup
			.map((action: GameAction) => {
				postProcessSubject.next(action);
				return action;
			})
			.reduce(applyAction, newState);
	};

	let nextFrame: FrameCollection = [];
	let prevState: GameState = initialState;
	let latestState: GameState = initialState;
	const app$ = bootstrap.pipe(
		reduce((state: GameState, action: GameAction) => g.reducer(state, action), initialState),
		switchMap(initialState => merge(epicActions$, subject, of({ type: "@@INIT" } as GameAction)).pipe(
			fastScan(applyAction, initialState),
			auditTime(drivers.framerates.logicalRender),
			tap(frame => latestState = frame)
		))
	);
	const sub = app$.subscribe();

	SFML_SetRenderer(function () {
		if (latestState !== prevState) {
			profile("Render::State->Frame", () => {
				prevState = latestState;
				nextFrame = game.render(latestState!);
			});
		}
		profile("Render::Frame->Eff(SFML)", () => renderToSfml(nextFrame));
	});

	setInterval(function () {
		profile("FlushEvents::Sfml->Eff", () => SFML_FlushEvents(event => {
			switch (event.type) {
				case SFML_Events.Closed:
					SFML_Close();
					Object.keys(stats)
						.sort()
						.forEach(statKey => {
							const stat = stats[statKey];
							const averageTime = stat.total / stat.count;
							console.log(`${statKey}: ${averageTime} | ${1 / Math.max(averageTime, 0.0001)}fps | (${stat.min} - ${stat.max})`);
						});
					sub.unsubscribe();
					break;
				case SFML_Events.MouseButtonPressed:
					drivers.mouse.mouseDown$.next([event.parameters[0], {
						x: event.parameters[1],
						y: event.parameters[2]
					}]);
					break;
				case SFML_Events.MouseButtonReleased:
					drivers.mouse.mouseUp$.next([event.parameters[0], {
						x: event.parameters[1],
						y: event.parameters[2]
					}]);
					break;
				case SFML_Events.MouseMoved:
					drivers.mouse.mouseMove$.next({
						x: event.parameters[0],
						y: event.parameters[1]
					});
					break;
			}
		}));
	}, 0);

} catch (ex) {
	const err: Error = ex;
	console.error(`${err.name}: ${err.message}\n${err.stack}`);
	throw ex;
}
