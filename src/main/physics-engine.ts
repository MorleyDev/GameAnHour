import { Engine, Events } from "matter-js";
import { Subject } from "rxjs/Subject";

import { EntityId } from "../pauper/entity-component/entity-base.type";

function makeEngine(): Engine {
	const createEngine = () => Engine.create();
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

function attachEvents(engine: Engine): Engine {
	Events.off(engine, "collisionStart", undefined as any);
	Events.off(engine, "collisionEnd", undefined as any);

	Events.on(engine, "collisionStart", (collision) => {
		collisionStart$.next({
			a: (collision.pairs[0].bodyA as any).name,
			b: (collision.pairs[0].bodyB as any).name
		});
	});
	Events.on(engine, "collisionEnd", (collision) => {
		collisionEnd$.next({
			a: (collision.pairs[0].bodyA as any).name,
			b: (collision.pairs[0].bodyB as any).name
		});
	});
	return engine;
}

export const engine = attachEvents(makeEngine());

// Highlights that this should be a Physics Driver
export const collisionStart$ = new Subject<{ a: EntityId; b: EntityId }>();
export const collisionEnd$ = new Subject<{ a: EntityId; b: EntityId }>();
