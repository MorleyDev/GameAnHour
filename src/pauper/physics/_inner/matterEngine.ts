import "poly-decomp";

import { Engine, Events } from "matter-js";

import { Seconds } from "../../models/time.model";
import { Collision } from "../collision.model";
import { PhysicsUpdateResult } from "../update.model";

function makeEngine(): Engine {
	const engine = Engine.create();
	// engine.enableSleeping = true;
	return engine;
}

const collisionStartEvents: Collision[] = [];
const collisionEndEvents: Collision[] = [];

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

export const matterJsPhysicsEngine = attachEvents(makeEngine());

export const updateEngine = (deltaTime: Seconds): PhysicsUpdateResult => {
	Engine.update(matterJsPhysicsEngine, deltaTime * 1000);
	return {
		collisionStarts: collisionStartEvents.splice(0, collisionStartEvents.length),
		collisionEnds: collisionEndEvents.splice(0, collisionEndEvents.length)
	};
};
