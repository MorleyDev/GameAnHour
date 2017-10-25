import { EntityId } from "./entity-base.type";

export type BaseComponent<TName extends string = string, TComponent = {}> = {
	readonly name: TName;

	// For nasty impure side-effects that may be required for interop with 3rd party libraries.
	// For example, connecting to a physics system since they tend to be inherently stateful and mutating.
	readonly events?: {
		readonly connect: (self: any, entityId: EntityId) => void;
		readonly disconnect: (self: any, entityId: EntityId) => void;
	}
} & TComponent;
