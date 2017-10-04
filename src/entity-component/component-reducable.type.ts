import { GenericAction } from "../functional/generic.action";
import { BaseComponent } from "./component-base.type";
import { Entity } from "./entity.type";

export type ReducableComponent<K extends string> = BaseComponent & {
	readonly name: K;
	readonly reduce: (previous: BaseComponent, action: GenericAction) => BaseComponent;
};
