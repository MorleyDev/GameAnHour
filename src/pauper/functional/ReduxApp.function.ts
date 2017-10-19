import { applyMiddleware, compose as productionCompose, createStore } from "redux";
import { Observable } from "rxjs/Observable";
import { empty } from "rxjs/observable/empty";
import { merge } from "rxjs/observable/merge";
import { of as of$ } from "rxjs/observable/of";
import { Observer } from "rxjs/Observer";
import { distinctUntilChanged } from "rxjs/operators/distinctUntilChanged";
import { map } from "rxjs/operators/map";
import { reduce } from "rxjs/operators/reduce";
import { scan } from "rxjs/operators/scan";
import { switchMap } from "rxjs/operators/switchMap";
import { tap } from "rxjs/operators/tap";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";

import { App } from "../core/App";
import { EventHandler } from "../core/events/eventhandler.service";
import { Renderer } from "../core/graphics/renderer.service";
import { Key } from "../core/models/keys.model";
import { Seconds } from "../core/models/time.model";
import { profile } from "../core/profiler";
import { GenericAction } from "./generic.action";
import { ReduxApp } from "./ReduxApp.type";
import { Render } from "./render-frame.function";
import { FrameCollection } from "./render-frame.model";
import { KeyDownAction } from "./system-keydown.action";
import { KeyUpAction } from "./system-keyup.action";

export function createReduxApp<
	TState,
	TAction extends GenericAction = GenericAction
	>(app: ReduxApp<TState, TAction>) {
	const devCompose: typeof productionCompose | undefined = typeof window !== "undefined" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
	const compose = devCompose || productionCompose;

	const reduxScan = (scanner: (state: TState, action: TAction) => TState, initial: TState): (input: Observable<TAction>) => Observable<TState> => {
		const store = createStore(scanner as any, initial, compose(applyMiddleware()));

		return self => self.pipe(scan((state: TState, action: TAction): TState => profile(action.type, () => {
			store.dispatch(action as any);
			return store.getState();
		}), initial));
	};
	const fastScan = scan;

	const appScan = process && process.env && process.env["NODE_ENV"] === "Production"
		? fastScan
		: (() => { console.log("using reduxScan"); return reduxScan; })();

	return class implements App {
		public readonly tick$: Subject<Seconds> = new Subject<Seconds>();
		public readonly render$: Subject<Renderer> = new Subject<Renderer>();
		public readonly actions$: Subject<TAction> = new Subject<TAction>();
		public readonly enableTick: boolean = false;

		private _subscriptions: Subscription[] = [];
		private _prevState: TState | undefined = undefined;

		constructor(private events: EventHandler, private shutdown: () => void) {
			const app$ = this.initialise(app);
			(window as any).app$ = app$;
			this._subscriptions = [
				this.initialise(app).subscribe(
					(x) => { },
					(err) => console.error(err),
					() => console.log("???")
				)
			];
		}

		initialise(app: ReduxApp<TState, TAction>): Observable<{}> {
			return (merge(
				// Init
				of$({ type: "@@INIT" }),

				// Tick
				this.tick$
					.pipe(map((deltaTime: Seconds) => ({ type: "@@TICK", deltaTime }))),

				// Key presses
				merge(
					this.events.keyDown().pipe(map((key: Key) => ({ type: 0, key }))),
					this.events.keyUp().pipe(map((key: Key) => ({ type: 1, key })))
				)
					.pipe(distinctUntilChanged((a: { type: 0 | 1; key: Key }, b: { type: 0 | 1; key: Key }) => a.type === b.type && a.key === b.key))
					.pipe(map((e: { type: 0 | 1; key: Key }) => e.type === 0 ? KeyDownAction(e.key) : KeyUpAction(e.key))),

				this.actions$,
				app.bootstrap || empty()
			) as Observable<TAction>)
				.pipe(selfFeeding(app.epic))
				.pipe(appScan((state: TState, action: TAction) => app.reducer(state, action), app.initialState || this._prevState))
				.pipe(tap((state: any) => {
					this._prevState = state;
					if (state && state.system && state.system.terminate) {
						this.shutdown();
					}
				}))
				.pipe(switchMap((state: TState) => this.render$.pipe(map((renderer: Renderer) => [renderer, state] as [Renderer, TState]))))
				.pipe(map(([renderer, state]: [Renderer, TState]) => [renderer, profile("@@PRERENDER", () => app.render(state))] as [Renderer, FrameCollection]))
				.pipe(map(([render, frame]) => profile("@@RENDER", () => Render(render, frame))))
				.pipe(reduce((prev, curr) => ({ })));
		}

		dispose(): void {
			this._subscriptions.forEach(subscription => subscription.unsubscribe());
			this._subscriptions = [];
		}

		public hot(app: ReduxApp<TState, TAction>) {
			console.warn("ReduxApp::hot(", app, ")");
			this.dispose();
			this._subscriptions = [
				this.initialise(app).subscribe(
					(x) => { },
					(err) => console.error(err),
					() => { }
				)
			];
		}

		update(deltaTime: Seconds): void {
			if (!this.enableTick) {
				return;
			}

			this.tick$.next(deltaTime);
		}

		draw(canvas: Renderer): void {
			this.render$.next(canvas);
		}
	};
}

function selfFeeding<T>(set: (o$: Observable<T>) => Observable<T>): (self: Observable<T>) => Observable<T> {
	return bootstrap$ => {
		return Observable.create((observer: Observer<T>) => {
			const subject = new Subject<T>();
			const boot = bootstrap$
				.subscribe(bootstrap => {
					subject.next(bootstrap);
					observer.next(bootstrap);
				}, err => observer.error(err), () => observer.complete());

			const followUps = set(subject).subscribe(observer);

			return () => {
				boot.unsubscribe();
				followUps.unsubscribe();
			};
		});
	};
}
