import { BaseComponent } from "./component-base.type";
import { GameAction } from "../game/game-action.type";
import { GameState } from "../game/game-state.type";
import { Entity } from "./entity.type";

export type EventTransformerComponent<K extends string> = BaseComponent & {
	readonly name: K;
	readonly transform: (world: { self: Entity; state: GameState }, action: GameAction) => GameAction[];
};
