import { HashMultiMap } from "../core/utility/hashmultimap";
import { GenericAction } from "./generic.action";
import { List } from "immutable";

export function createReducer<TState, TAction extends GenericAction = GenericAction>(...reducer: [string, (state: TState, action: TAction) => TState][]) {
	const reducerMap = List(reducer)
		.groupBy(r => r[0])
		.map(r => r.map(l => l[1]));

	return (state: TState, action: TAction): TState => {
		const reducer = reducerMap.get(action.type);

		return reducer != null
			? reducer.reduce((prev, curr) => curr(prev, action), state)
			: state;
	}
}
