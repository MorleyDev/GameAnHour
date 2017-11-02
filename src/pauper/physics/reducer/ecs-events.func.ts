import { StaticBodyComponent } from "../component/StaticBodyComponent";
import { HardBodyComponent } from "../component/HardBodyComponent";
import { matterJsPhysicsEngine } from "../_inner/matterEngine";
import { EntityComponentReducerEvents } from "../../ecs/entity-component.reducer";
import { World, IChamferableBodyDefinition, Bodies, Vector, Body } from "matter-js";
import { Shape2Type } from "../../models/shapes.model.type";
import { Shape2, Rectangle, Circle } from "../../models/shapes.model";

export const physicsEcsEvents: EntityComponentReducerEvents = {
	attach(entityId, c) {
		switch (c.name) {
			case "HardBodyComponent": {
				const component = c as HardBodyComponent;
				component._body = shapeToBody(Shape2.add(component.shape, component.position), {
					restitution: component.elasticity,
					angularVelocity: component.angularVelocity,
					angle: component.rotation,
					velocity: component.velocity,
					position: component.position,
					density: component.density,
					name: entityId,
					isStatic: false
				});
				World.add(matterJsPhysicsEngine.world, component._body!);
				return;
			}
			case "StaticBodyComponent": {
				const component = c as StaticBodyComponent;
				component._body = shapeToBody(Shape2.add(component.shape, component.position), {
					position: component.position,
					name: entityId,
					isStatic: true
				});
				World.add(matterJsPhysicsEngine.world, component._body!);
			}
		}
	},
	detach(entityId, c) {
		switch (c.name) {
			case "HardBodyComponent":
			case "StaticBodyComponent": {
				const component = c as HardBodyComponent | StaticBodyComponent;
				World.remove(matterJsPhysicsEngine.world, component._body!);
			}
		}
	}
};

const shapeToBody = (shape: Shape2Type, props: IChamferableBodyDefinition & { readonly name: string }): Body => {
	if (Array.isArray(shape)) {
		const centre = Shape2.getCentre(shape);
		return Bodies.fromVertices(centre.x, centre.y, [shape.map(({ x, y }) => Vector.create(x, y))], props);
	} else if (Rectangle.is(shape)) {
		return Bodies.rectangle(shape.x + shape.width / 2, shape.y + shape.height / 2, shape.width, shape.height, props);
	} else if (Circle.is(shape)) {
		return Bodies.circle(shape.x, shape.y, shape.radius, props);
	} else {
		throw new Error();
	}
};
