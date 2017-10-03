import { FrameCollection } from "../functional/render-frame.model";
import { EntitiesState } from "./entities.state";
import { Entity } from "./entity.type";

export function entityComponentRender(state: EntitiesState): FrameCollection {
	const renderEntity = (entity: Entity): FrameCollection =>
		entity.components
			.filter(c => c.render != null)
			.map(c => c.render!(entity));

	return state.entities.map(([_, entity]) => renderEntity(entity));
}
