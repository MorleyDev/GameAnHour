import { Seconds } from "../../core/models/time.model";
import { Frame } from "../../functional/render-frame.model";
import { GameAction } from "../game/game-action.type";
import { GameState } from "../game/game-state.type";
import { Entity } from "./entity.type";

export type Component = {
	readonly name: string;
	readonly transform?: (world: { self: Entity; state: GameState }, action: GameAction) => GameAction[];
	readonly tick?: (world: { self: Entity; state: GameState }, deltaTime: Seconds) => GameAction[];
	readonly data?: any;
	readonly render?: (self: Entity) => Frame;
	readonly reduce?: (previous: Entity, action: GameAction) => Entity;
};
