import { HashMultiMap } from "../core/utility/hashmultimap";
import { GenericAction } from "./generic.action";

export function createReducer<TState, TAction extends GenericAction>(...reducer: [string, (state: TState, action: TAction) => TState][]) {
	const reducerMap = HashMultiMap.fromArray(reducer, r => r[0], r => r[1]);
	return (state: TState, action: TAction): TState => {
		const reducer = reducerMap.at(action.type);
		
		return reducer != null
			? reducer.reduce((prev, curr) => curr(prev, action), state)
			: state;
	}
}
