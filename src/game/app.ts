import { Observable } from "rxjs/Observable";

import { SystemAction } from "../functional/app.actions";
import { Clear, Frame } from "../functional/frame.model";
import { createReduxApp } from "../functional/redux.app";

type GameState = { };

type AnyAction = SystemAction;

export const AppFactory = createReduxApp<GameState, AnyAction>({
	initialState: { },
	update: tick => Observable.empty<AnyAction>(),
	reducer: (prev: GameState, curr: AnyAction): GameState => prev,
	render: state => Frame(Clear),
	epics: []
});
