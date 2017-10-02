export type SystemState = {
	system: {
		terminate: boolean;
	}
};

export const SystemState = <TState>(state: TState): TState & SystemState => ({
	system: { terminate: false },
	...(state as any)
});
