import { Seconds } from "../core/models/time.model";
import { GenericAction } from "../functional/generic.action";
import { Frame } from "../functional/render-frame.model";
import { Entity } from "./entity.type";

export type Component = {
	readonly name: string;

	readonly transform?: (self: Entity, action: GenericAction) => ReadonlyArray<GenericAction>;
	readonly reduce?: (previous: Component, action: GenericAction) => Component;
	readonly tick?: (self: Entity, deltaTime: Seconds) => ReadonlyArray<GenericAction>;
	readonly render?: (self: Entity) => Frame;
	readonly data?: any;
};
