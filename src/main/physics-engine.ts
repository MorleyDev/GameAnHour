// import "poly-decomp";

import { Engine, Events } from "matter-js";

import { Seconds } from "../pauper/core/models/time.model";
import { EntityId } from "../pauper/entity-component/entity-base.type";

function makeEngine(): Engine {
	const createEngine = () => {
		const engine = Engine.create();
		// engine.enableSleeping = true;
		return engine;
	};
	if (typeof window === "undefined") {
		return createEngine();
	} else {
		// Hacky hacky to preserve physicsEngine across hot-code reloads
		// Long-term probably want to be able to specify such things as app drivers
		if ((window as any).physicsEngine != null) {
			return (window as any).physicsEngine;
		} else {
			(window as any).physicsEngine = createEngine();
			return (window as any).physicsEngine;
		}
	}
}

const collisionStartEvents: { a: EntityId; b: EntityId }[] = [];
const collisionEndEvents: { a: EntityId; b: EntityId }[] = [];

function attachEvents(engine: Engine): Engine {
	Events.off(engine, "collisionStart", undefined as any);
	Events.off(engine, "collisionEnd", undefined as any);

	Events.on(engine, "collisionStart", (collision) => {
		const a = (collision.pairs[0].bodyA as any).name;
		const b = (collision.pairs[0].bodyB as any).name;
		collisionStartEvents.push({ a, b });
	});
	Events.on(engine, "collisionEnd", (collision) => {
		const a = (collision.pairs[0].bodyA as any).name;
		const b = (collision.pairs[0].bodyB as any).name;
		collisionEndEvents.push({ a, b });
	});
	return engine;
}

export const engine = attachEvents(makeEngine());

export type EngineUpdateResults = {
	collisionStart: { a: EntityId; b: EntityId }[];
	collisionEnd: { a: EntityId; b: EntityId }[];
};

export const updateEngine = (engine: Engine, deltaTime: Seconds): EngineUpdateResults => {
	Engine.update(engine, deltaTime * 1000);
	return {
		collisionStart: collisionStartEvents.splice(0, collisionStartEvents.length),
		collisionEnd: collisionEndEvents.splice(0, collisionEndEvents.length)
	};
};
