import { BaseComponent } from "./component-base.type";

export type BaseEntity = {
	id: Symbol;
	components: BaseComponent[];
};
