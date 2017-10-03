import { GenericAction } from "../functional/generic.action";
import { BaseComponent } from "./component-base.type";
import { Entity } from "./entity.type";

export type EventTransformerComponent<K extends string> = BaseComponent & {
	readonly name: K;
	readonly transform: (self: Entity, action: GenericAction) => GenericAction[];
};
