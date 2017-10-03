import { GameAction } from "../game/game-action.type";
import { BaseComponent } from "./component-base.type";
import { Entity } from "./entity.type";

export type ReducableComponent<K extends string> = BaseComponent & {
	readonly name: K;
	readonly reduce: (previous: Entity, action: GameAction) => Entity;
};
