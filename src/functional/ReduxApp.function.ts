import { applyMiddleware, compose as productionCompose, createStore } from "redux";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { of as of$ } from "rxjs/observable/of";
import { distinctUntilChanged } from "rxjs/operator/distinctUntilChanged";
import { _do } from "rxjs/operator/do";
import { filter } from "rxjs/operator/filter";
import { publish } from "rxjs/operator/publish";
import { map } from "rxjs/operator/map";
import { scan } from "rxjs/operator/scan";
import { switchMap } from "rxjs/operator/switchMap";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";

import { App } from "../core/App";
import { EventHandler } from "../core/events/eventhandler.service";
import { fcall } from "../core/extensions/Object.fcall.func";
import { Renderer } from "../core/graphics/renderer.service";
import { Key } from "../core/models/keys.model";
import { Seconds } from "../core/models/time.model";
import { ReduxApp } from "./ReduxApp.type";
import { Render } from "./render-frame.function";
import { FrameCollection } from "./render-frame.model";
import { KeyDownAction } from "./system-keydown.action";
import { KeyUpAction } from "./system-keyup.action";
import { ConnectableObservable } from "rxjs/observable/ConnectableObservable";

export function createReduxApp<
	TState,
	TAction
>(app: ReduxApp<TState, TAction>) {
	const devCompose: typeof productionCompose | undefined = typeof window !== "undefined" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
	const compose = devCompose || productionCompose;

	const stats: { [key: string]: { count: number; max: number; min: number, avg: number; } } = {};
	(window as any).stats = stats;

	const reduxScan = (self: Observable<TAction>, scanner: (state: TState, action: TAction) => TState, initial: TState): Observable<TState> => {
		const store = createStore(scanner as any, initial, compose(applyMiddleware()));
		return fcall(self, scan, (state: TState, action: TAction): TState => {
			const startTime = new Date().valueOf();
			store.dispatch(action as any);
			const endTime = new Date().valueOf();
			const takenTime = endTime - startTime;
			const currentStats = stats[((action as any).type as string)] || { count: 0, max: takenTime, min: takenTime, avg: takenTime };
			stats[((action as any).type as string)] = {
				count: currentStats.count + 1,
				max: Math.max(takenTime, currentStats.max),
				min: Math.min(takenTime, currentStats.min),
				avg: (takenTime + currentStats.avg) / 2
			};
			return store.getState();
		}, initial);
	};
	const fastScan = (self: Observable<TAction>, scanner: (state: TState, action: TAction) => TState, initial: TState): Observable<TState> =>
		fcall(self, scan, scanner, initial);

	const appScan = process && process.env && process.env["NODE_ENV"] === "Production"
		? fastScan
		: reduxScan;

	return class implements App {
		public readonly tick$: Subject<Seconds> = new Subject<Seconds>();
		public readonly render$: Subject<Renderer> = new Subject<Renderer>();
		public readonly actions$: Subject<TAction> = new Subject<TAction>();

		private _subscriptions: Subscription[] = [];
		private _prevState: TState | undefined = undefined;

		constructor(private events: EventHandler, private shutdown: () => void) {
			this.initialise(app);
		}

		initialise(app: ReduxApp<TState, TAction>) {
			const tick$action$ = fcall(this.tick$, map, (deltaTime: Seconds) => ({ type: "@@TICK", deltaTime }));
			const keypresses$ = keyPresses(this.events.keyDown(), this.events.keyUp());
			const core$actions$ = merge(of$({ type: "@@INIT" }), tick$action$, keypresses$, this.actions$) as Observable<TAction>;

			const epic$actions$ = new Subject<TAction>();
			const merged$core$epic$actions$ = fcall(merge(core$actions$, epic$actions$), publish) as ConnectableObservable<TAction>;
			const epic$reemitting$actions$ = fcall(app.epic(merged$core$epic$actions$), filter, (action: TAction) => { epic$actions$.next(action); return false; });
			const all$actions$ = merge(merged$core$epic$actions$, epic$reemitting$actions$);

			const scan$state$ = reduxScan(all$actions$, (state: TState, action: TAction) => app.reducer(state, action), this._prevState || app.initialState);
			const state$ = fcall(scan$state$, _do, (state: any) => {
				this._prevState = state;
				if (state && state.system && state.system.terminate) {
					this.shutdown();
				}
			});

			const latest$render$state$ = fcall(state$, switchMap, (state: TState) => fcall(this.render$, map, (renderer: Renderer) => [renderer, state]) as Observable<[Renderer, TState]>);
			const latest$render$frame$ = fcall(latest$render$state$, map, ([renderer, state]: [Renderer, TState]) => [renderer, app.render(state)]) as Observable<[Renderer, FrameCollection]>;
			const latest$render$frame$subscription = latest$render$frame$.subscribe(([render, frame]) => Render(render, frame));

			this._subscriptions = [
				latest$render$frame$subscription,
				merged$core$epic$actions$.connect()
			];
		}

		dispose(): void {
			this._subscriptions.forEach(subscription => subscription.unsubscribe());
			this._subscriptions = [];
		}

		public hot(app: ReduxApp<TState, TAction>) {
			console.log("ReduxApp::hot(", app, ")");
			this.dispose();
			this.initialise(app);
		}

		update(deltaTime: Seconds): void {
			this.tick$.next(deltaTime);
		}

		draw(canvas: Renderer): void {
			this.render$.next(canvas);
		}
	};
}

function keyPresses(keydown: Observable<Key>, keyup: Observable<Key>): Observable<KeyUpAction | KeyDownAction> {
	const keydown$ = fcall(keydown, map, (key: Key) => ({ type: 0, key }));
	const keyup$ = fcall(keyup, map, (key: Key) => ({ type: 1, key }));
	const merged$keyup$keydown$ = merge(keydown$, keyup$);
	const keypress$ = fcall(merged$keyup$keydown$, distinctUntilChanged, (a: { type: 0 | 1; key: Key }, b: { type: 0 | 1; key: Key }) => a.type === b.type && a.key === b.key);
	const keypress$actions$ = fcall(keypress$, map, (e: { type: 0 | 1; key: Key }) => e.type === 0 ? KeyDownAction(e.key) : KeyUpAction(e.key));

	return keypress$actions$ as Observable<KeyUpAction | KeyDownAction>;
}
