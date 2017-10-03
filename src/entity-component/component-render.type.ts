import { Frame } from "../functional/render-frame.model";
import { BaseComponent } from "./component-base.type";
import { Entity } from "./entity.type";

export type RenderComponent<K extends string> = BaseComponent & {
	readonly name: K;
	readonly render: (self: Entity) => Frame;
};
