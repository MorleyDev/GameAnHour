import { Seconds } from "../../core/models/time.model";
import { GameAction } from "../game/game-action.type";
import { GameState } from "../game/game-state.type";
import { BaseComponent } from "./component-base.type";
import { Entity } from "./entity.type";

export type EventSourceComponent<K extends string> = BaseComponent & {
	readonly name: K;
	readonly tick: (world: { self: Entity; state: GameState }, deltaTime: Seconds) => GameAction[];
};
