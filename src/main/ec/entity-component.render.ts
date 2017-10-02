import { Entity } from "./entity.type";
import { FrameCollection } from "../../functional/render-frame.model";
import { GameState } from "../game/game-state.type";

export function entityComponentRender(state: GameState): FrameCollection {
	const renderEntity = (entity: Entity): FrameCollection =>
		entity.components
			.filter(c => c.render != null)
			.map(c => c.render!(entity));

	return state.entities.map(renderEntity);
}

