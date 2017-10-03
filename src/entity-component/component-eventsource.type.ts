import { Seconds } from "../core/models/time.model";
import { GenericAction } from "../functional/generic.action";
import { BaseComponent } from "./component-base.type";
import { Entity } from "./entity.type";

export type EventSourceComponent<K extends string> = BaseComponent & {
	readonly name: K;
	readonly tick: (world: { self: Entity; state: any }, deltaTime: Seconds) => GenericAction[];
};
