export function combineReducers<TState, TAction>(..._reducers: ((state: TState, action: TAction) => TState)[]): (state: TState, action: TAction) => TState {
	return (state: TState, action: TAction): TState => _reducers.reduce((state, reducer) => reducer(state, action), state);
}
