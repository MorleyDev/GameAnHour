export type BaseComponent<TComponent = any> = {
	readonly name: string;

	// For nasty impure side-effects that may be required for interop with 3rd party libraries.
	// For example, connecting to a physics system since they tend to be inherently stateful and mutating.
	readonly events?: {
		readonly connect: (self: any) => void;
		readonly disconnect: (self: any) => void;
	}
} & TComponent;
