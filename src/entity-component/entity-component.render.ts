import { FrameCollection } from "../functional/render-frame.model";
import { EntitiesState } from "./entities.state";
import { Entity } from "./entity.type";

export function entityComponentRender(state: EntitiesState): FrameCollection {
	const renderEntity = (entity: Entity): FrameCollection =>
		entity.components
			.filter(([_, component]) => component.render != null)
			.map(([_, component]) => component.render!(entity));

	return state.entities.map(([_, entity]) => renderEntity(entity));
}
