import "./core/extensions";

import { SystemAction } from "./functional/app.actions";
import { Clear, Frame } from "./functional/frame.model";
import { _, match } from "./functional/pattern-match.function";
import { run } from "./functional/run.function";

type GameState = { };
type GameTick = [GameState, number];
type AnyAction = SystemAction;

const initialState: GameState = { };

run<GameState, AnyAction>({
	initialState,
	update: [],
	reducer: (prev: GameState, curr: AnyAction): GameState => match(curr, [
		[_, () => prev]
	]),
	render: state => Frame(Clear),
	epics: []
});
