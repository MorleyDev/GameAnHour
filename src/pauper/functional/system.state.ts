export type SystemState = {
	system: {
		terminate: boolean;
		tick: boolean;
	}
};

export const SystemState = <TState>(state: TState): TState & SystemState => ({
	...(state as any),
	system: {
		terminate: false,
		tick: true
	}
} as TState & SystemState);
