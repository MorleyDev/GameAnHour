import { compose as productionCompose } from "redux";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { of as of$ } from "rxjs/observable/of";
import { distinctUntilChanged } from "rxjs/operator/distinctUntilChanged";
import { filter } from "rxjs/operator/filter";
import { _do } from "rxjs/operator/do";
import { letProto } from "rxjs/operator/let";
import { map } from "rxjs/operator/map";
import { scan } from "rxjs/operator/scan";
import { mergeMap } from "rxjs/operator/mergeMap";
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

export function createReduxApp<
	TState,
	TAction
>(appFactory: () => ReduxApp<TState, TAction>) {
	let app = appFactory();

	return class implements App {
		public readonly tick$: Subject<Seconds> = new Subject<Seconds>();
		public readonly render$: Subject<Renderer> = new Subject<Renderer>();
		public readonly actions$: Subject<TAction> = new Subject<TAction>();
		public subscriptions: Subscription[] = [];

		constructor(private events: EventHandler, private shutdown: () => void) {
			this.initialise(app);
		}

		initialise(app: ReduxApp<TState, TAction>) {
			const tick$action$ = fcall(this.tick$, map, (deltaTime: Seconds) => ({ type: "@@TICK", deltaTime }));
			const keypresses$ = keyPresses(this.events.keyDown(), this.events.keyUp());
			const system$actions$ = merge(of$({ type: "@@INIT" }), tick$action$, keypresses$, this.actions$) as Observable<TAction>;
			const epic$actions$ = new Subject<TAction>();
			const actions$ = merge(system$actions$, epic$actions$);
			const merged$actions$ = merge(actions$, fcall(app.epic(actions$), _do, (action: TAction) => epic$actions$.next(action)));
			const scan$state$ = fcall(merged$actions$, scan, (state: TState, action: TAction) => app.reducer(state, action), app.initialState);
			const state$ = fcall(scan$state$, _do, (state: any) => (state && state.system && state.system.terminate && this.shutdown()));

			const latest$render$state$ = fcall(state$, switchMap, (state: TState) => fcall(this.render$, map, (renderer: Renderer) => [renderer, state]) as Observable<[Renderer, TState]>);
			const latest$render$frame$ = fcall(latest$render$state$, map, ([renderer, state]: [Renderer, TState]) => [renderer, app.render(state)]) as Observable<[Renderer, FrameCollection]>;
			const latest$render$frame$subscription = latest$render$frame$.subscribe(([render, frame]) => Render(render, frame));

			this.subscriptions = [ latest$render$frame$subscription ];
		}

		dispose(): void {
			this.subscriptions.forEach(subscription => subscription.unsubscribe());
			this.subscriptions = [];
		}

		public hot(appFactory: () => ReduxApp<TState, TAction>) {
			this.dispose();
			this.initialise(appFactory());
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
