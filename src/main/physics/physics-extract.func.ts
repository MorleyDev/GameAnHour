import { Point2 } from "../../core/models/point/point.model";
import { Shape2 } from "../../core/models/shapes.model";
import { HashMap } from "../../core/utility/hashmap";
import { Component } from "../../entity-component/component.type";
import { PhysicsCollidableComponent } from "./physics-collidable.component";
import { PhysicsObjectComponent } from "./physics-object.component";

export function extractCoord(components: HashMap<string, Component>) {
	const blob = components.at("PHYSICS_OBJECT") as PhysicsObjectComponent | undefined;

	return (blob != null) ? blob.data.position : Point2(0, 0);
}

export function extractMesh(components: HashMap<string, Component>): Shape2[] {
	const blob = components.at("PHYSICS_COLLIDABLE") as PhysicsCollidableComponent | undefined;
	return (blob != null) ? blob.data.mesh : [];
}

export function extractCollisionMap(components: HashMap<string, Component>): Shape2[] {
	const mesh = extractMesh(components);
	const position = extractCoord(components);

	return mesh.map(part => Shape2.add(part, position));
}
