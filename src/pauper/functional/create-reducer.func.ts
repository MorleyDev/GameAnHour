import { List } from "immutable";

import { GenericAction } from "./generic.action";
import { SpecificReducer } from "./reducer.type";

export type ReducerPair<TState, TAction> = [string, (state: TState, action: TAction) => TState];

export function createReducer<TState, TAction extends GenericAction = GenericAction>(..._reducers: (ReducerPair<TState, TAction>)[]): SpecificReducer<TState, TAction> {
	const reducerMap = List(_reducers)
		.groupBy(r => r[0])
		.map(r => r.map(l => l[1]));

	return (state: TState, action: TAction): TState => {
		const reducer = reducerMap.get(action.type);

		return reducer != null
			? reducer.reduce((prev, curr) => curr(prev, action), state)
			: state;
	};
}
