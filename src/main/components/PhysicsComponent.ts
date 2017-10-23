import { World, Bodies, Body } from "matter-js";

import { Radian } from "../../pauper/core/maths/angles.maths";
import { Point2, Rectangle } from "../../pauper/core/models/shapes.model";
import { BaseComponent } from "../../pauper/entity-component/component-base.type";
import { engine } from "../physics-engine";

export type PhysicsComponent = BaseComponent<{
	readonly name: "PhysicsComponent";
	readonly position: Point2;
	readonly rotation: Radian;

	readonly events: {
		connect(component: PhysicsComponent): void;
		disconnect(component: PhysicsComponent): void;
	};

	_body: Body | null;
}>;

export const PhysicsComponent = (position: Point2, isStatic: boolean): PhysicsComponent => ({
	name: "PhysicsComponent",
	events: {
		connect: (component: PhysicsComponent) => {
			component._body = Bodies.rectangle(component.position.x - 20, component.position.y - 20, 40, 40, { isStatic });
			World.add(engine.world, component._body);
		},
		disconnect: (component: PhysicsComponent) => {
			World.remove(engine.world, component._body!);
		}
	},
	_body: null,
	position,
	rotation: 0
});


// Cheating the immutability by exploiting the lack of laziness!
// ----------------------------------------------------------------

// Given value T, perform some sideEffect using that value and then return T
const sideEffect = <T>(seed: T, sideEffect: (value: T) => void): T => {
	return effectVar(seed, sideEffect(seed));
};

/* Allows for the value passed in to be retrieved and whatever side-effect causing values have been passed in to be evaluated and discarded */
const effectVar = <T, U>(value: T, ..._u: U[]): T => value;
