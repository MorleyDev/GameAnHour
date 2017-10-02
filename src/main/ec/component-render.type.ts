import { Frame } from "../../functional/render-frame.model";
import { BaseComponent } from "./component-base.type";
import { GameAction } from "../game/game-action.type";
import { GameState } from "../game/game-state.type";
import { Entity } from "./entity.type";

export type RenderComponent<K extends string> = BaseComponent & {
	readonly name: K;
	readonly render: (self: Entity) => Frame;
};
