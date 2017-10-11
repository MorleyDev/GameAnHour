import { GenericAction } from "./generic.action";

export type SpecificReducer<TState, TAction extends GenericAction> = (state: TState, action: TAction) => TState;
export type GenericReducer = <TState, TAction extends GenericAction>(state: TState, action: TAction) => TState;
