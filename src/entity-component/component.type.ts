import { Seconds } from "../core/models/time.model";
import { GenericAction } from "../functional/generic.action";
import { Frame } from "../functional/render-frame.model";
import { Entity } from "./entity.type";

export type Component = {
	readonly name: string;

	readonly transform?: (world: { self: Entity; state: any }, action: GenericAction) => GenericAction[];
	readonly tick?: (world: { self: Entity; state: any }, deltaTime: Seconds) => GenericAction[];
	readonly render?: (self: Entity) => Frame;
	readonly reduce?: (previous: Entity, action: GenericAction) => Entity;
	readonly data?: any;
};
