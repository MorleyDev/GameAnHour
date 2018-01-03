import * as React from "react";

import { map, scan } from "rxjs/operators";

import { AppDrivers } from "@morleydev/pauper/app-drivers";
import { Game } from "./game-render";
import { GameAction } from "./game-action";
import { GameState } from "./game-state";
import { Subscription } from "rxjs/Subscription";
import { bootstrap } from "./game-bootstrap";
import { concat } from "rxjs/observable/concat";
import { createReducer } from "./game-reducer";
import { interval } from "rxjs/observable/interval";
import { merge } from "rxjs/observable/merge";

export type GameAppProps = {
	readonly initialState: GameState;
	readonly drivers: AppDrivers;
};

export class GameApp extends React.Component<GameAppProps, GameState> {
	private subscription: Subscription;

	constructor(props: GameAppProps) {
		super(props);
		this.state = props.initialState;

		const timestep = 1 / 60;
		const reducer = createReducer(props.drivers);
		const tick = interval(timestep).pipe(map(x => ({ type: "@@TICK", deltaTime: timestep })));
		const advancePhysics = interval(timestep).pipe(map(x => ({ type: "@@ADVANCE_PHYSICS", deltaTime: timestep })));

		this.subscription = concat(bootstrap(props.drivers), merge(tick, advancePhysics)).pipe(
			scan<GameAction, GameState>(reducer, props.initialState)
		).subscribe((state: GameState) => {
			this.setState(state);
		});
		(window as any).gameApp = this;
	}

	public componentWillUnmount() {
		this.subscription.unsubscribe();
	}

	public render(): JSX.Element {
		return (<Game state={this.state} />);
	}
}
