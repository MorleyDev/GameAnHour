import { GenericAction } from "./generic.action";
import { SpecificReducer } from "./reducer.type";

export type ReducerPair<TState, TAction> = [string, (state: TState, action: any & TAction) => TState];

export function createReducer<TState, TAction extends GenericAction = GenericAction>(..._reducers: (ReducerPair<TState, TAction>)[]): SpecificReducer<TState, TAction> {
	const reducerMap: { [key: string]: SpecificReducer<TState, TAction>[] } = {};
	for (const pair of _reducers) {
		reducerMap[pair[0]] = (reducerMap[pair[0]] || []).concat(pair[1]);
	}

	return (state: TState, action: TAction): TState => {
		const reducer =  reducerMap[action.type];

		return reducer != null
			? reducer.reduce((prev, curr) => curr(prev, action), state)
			: state;
	};
}
