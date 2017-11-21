import { Point2 } from "../pauper/models/shapes.model";
import { PlayerComponent } from "./component/types";
import { createEntitiesStateMap } from "../pauper/ecs/create-entities-state-map.func";
import { RGBA, RGB } from "../pauper/models/colour.model";
import { Clear, Fill, Origin, Rotate, FrameCollection } from "../pauper/render/render-frame.model";
import { GameState } from "./game.model";
import { HardBodyComponent } from "../pauper/physics/component/HardBodyComponent";
import { EntityId } from "../pauper/ecs/entity-base.type";

const renderPlayers = createEntitiesStateMap(["PlayerComponent", "HardBodyComponent"], (id: EntityId, player: PlayerComponent, body: HardBodyComponent) => {
	return [
		Origin(body.position, [
			Rotate(body.rotation, [
				Fill(body.shape, RGBA(255, 255, 255, 1))
			])
		])
	];
});

export const render = () => {
	return (state: GameState): FrameCollection => [
		Clear(RGB(0, 0, 0)),
		Origin(Point2(256, 256), [
			...Array.from( renderPlayers(state) )
		])
	];
};
