export function combineReducers<TState, TAction>(...reducers: ((state: TState, action: TAction) => TState)[]): (state: TState, action: TAction) => TState {
	return (state: TState, action: TAction): TState => reducers.reduce((state, reducer) => reducer(state, action), state)
}
