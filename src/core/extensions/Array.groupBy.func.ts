export function groupBy<T, K extends string>(this: Array<T>, keySelector: (value: T, index: number, initial: T[]) => K) {
	return this
		.map((element, index, initial) => ({ key: keySelector(element, index, initial), value: element }))
		.reduce((record, kv) => ({ ...(record as any), [kv.key]: (record[kv.key] || []).concat(kv.value) }), { } as { [P in K]: T[] | undefined });
		// K extends string due to https://github.com/Microsoft/TypeScript/issues/13042
		// (record as any) due to https://github.com/Microsoft/TypeScript/issues/14409
}
