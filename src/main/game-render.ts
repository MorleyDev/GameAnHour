import { createEntitiesStateMap } from "../pauper/ecs/create-entities-state-map.func";
import { exponentialInterpolation } from "../pauper/maths/interpolation.maths";
import { Vector2 } from "../pauper/maths/vector.maths";
import { Colour } from "../pauper/models/colour.model";
import { Text2 } from "../pauper/models/shapes.model";
import { Seconds } from "../pauper/models/time.model";
import { HardBodyComponent } from "../pauper/physics/component/HardBodyComponent";
import { StaticBodyComponent } from "../pauper/physics/component/StaticBodyComponent";
import { profile } from "../pauper/profiler";
import { Clear, Fill, Origin, Rotate } from "../pauper/render/render-frame.model";
import { FloatingScoreComponent } from "./components/FloatingScoreComponent";
import { RenderedComponent } from "./components/RenderedComponent";
import { GameState } from "./game.model";

const entityRenderer = createEntitiesStateMap(["RenderedComponent", "HardBodyComponent"], (id: string, { rgb }: RenderedComponent, physics: HardBodyComponent) => {
	return Origin(physics.position, [
		Rotate(physics.rotation, [
			Fill(physics.shape, Colour(rgb.r, rgb.g, rgb.b, exponentialInterpolation(Math.E)(1, 0)(Math.max(1, physics.restingTime) - 1) ** 2))
		])
	]);
});

const staticEntityRenderer = createEntitiesStateMap(["RenderedComponent", "StaticBodyComponent"], (id: string, { rgb }: RenderedComponent, { position, shape }: StaticBodyComponent) => {
	return Origin(position, [
		Fill(shape, rgb)
	]);
});

const scoreTextRenderer = createEntitiesStateMap(["FloatingScoreComponent"], (id: string, physics: FloatingScoreComponent, runtime: Seconds) => {
	const interpolateTo = Math.max(0, Math.min(1, (runtime - physics.startingTick) / physics.lifespan));
	const position = Vector2.linearInterpolation(physics.startPosition, physics.endPosition)(interpolateTo);

	return [
		Fill(Text2(`${physics.score}`, position.x, position.y, 24, "sans-serif"), Colour(255, 255, 255, exponentialInterpolation(Math.E)(1, 0)(interpolateTo)))
	];
});

export const render = (state: GameState) => [
	Clear(Colour(0, 0, 0)),

	profile("Render::(RenderedComponent, StaticBodyComponent)->Frame", () => Array.from(staticEntityRenderer(state))),
	profile("Render::(RenderedComponent, HardBodyComponent)->Frame", () => Array.from(entityRenderer(state))),
	profile("Render::(FloatingScoreComponent)->Frame", () => Array.from(scoreTextRenderer(state, state.runtime))),

	Fill(Text2(`Score: ${state.score}`, 0, 0, 24, "sans-serif"), Colour(255, 0, 0)),
	Fill(Text2(`Runtime: ${state.runtime}`, 30, 60, 16, "sans-serif"), Colour(255, 0, 0))
];
