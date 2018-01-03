import "@morleydev/pauper/render/jsx/render";

import * as React from "react";

import { $$, Generators, Iterables } from "@morleydev/functional-pipe";
import { Circle, Point2 } from "@morleydev/pauper/models/shapes.model";
import { Clear, Fill, FrameCollection, Origin, Rotate } from "@morleydev/pauper/render/render-frame.model";
import { concat, range } from "@morleydev/functional-pipe/iterable/generators";

import { AnimationCycle } from "./components/AnimationCycle";
import { EntityId } from "@morleydev/pauper/ecs/entity-base.type";
import { GameState } from "./game-state";
import { HardBodyComponent } from "@morleydev/pauper/physics/component/HardBodyComponent";
import { RGB } from "@morleydev/pauper/models/colour.model";
import { createEntitiesStateMap } from "@morleydev/pauper/ecs/create-entities-state-map.func";

const { map } = Iterables;

const repeatReversed = function* <T>(it: Iterable<T>): Iterable<T> {
		const buffer: T[] = [];
		for (const item of it) {
			buffer.push(item);
			yield item;
		}
		buffer.reverse();
		yield* buffer;
};

const repeat = function <T>(times: number): (it: Iterable<T>) => Iterable<T> {
	return function* (it) {
		const buffer: T[] = [];
		for (const item of it) {
			buffer.push(item);
			yield item;
		}
		for (let i = 0; i < times; ++i) {
			yield* buffer;
		}
	};
};

const drawEntities = createEntitiesStateMap(["HardBodyComponent"], (id: EntityId, hbc: HardBodyComponent) => {
	return (
		<origin key={id} coords={hbc.position}>
			<rotate radians={hbc.rotation}>
				<AnimationCycle framerate={255}>
					{...$$(Generators.range(0, 256))
						.$(map(c => RGB(c, c, c)))
						.$(map(colour => <fill key={colour.r} colour={colour} shape={hbc.shape} />))
						.$(repeatReversed)
						.$$(arr => Array.from(arr))}
				</AnimationCycle>
			</rotate>
		</origin>
	);
});

export const Game = ({ state }: { state: GameState }): JSX.Element => (
	<clear colour={RGB(0, 0, 0)}>
		<origin coords={Point2(256, 256)}>
			{...Array.from(drawEntities(state))}
		</origin>
	</clear>
);
