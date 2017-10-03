import { BaseComponent } from "./component-base.type";

export type ValueComponent<K extends string, T> = BaseComponent & {
	readonly name: K;
	readonly data: Readonly<T>;
};
