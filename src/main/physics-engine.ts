import { Engine } from "matter-js";

function makeEngine(): Engine {
	if (typeof window === "undefined") {
		return Engine.create();
	} else { // Hacky hacky to preserve physicsEngine across hot-code reloads
		// Long-term probably want to be able to specify such things as app drivers
		if ((window as any).physicsEngine != null) {
			return (window as any).physicsEngine;
		} else {
			(window as any).physicsEngine = Engine.create();
			return (window as any).physicsEngine;
		}
	}
}

export const engine = makeEngine();
