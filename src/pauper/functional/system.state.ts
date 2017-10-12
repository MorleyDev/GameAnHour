export type SystemState = {
	system: {
		terminate: boolean;
	}
};

export const SystemState = <TState>(state: TState): TState & SystemState => ({
	...(state as any),
	system: {
		terminate: false
	}
} as TState & SystemState);
