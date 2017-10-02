export function groupBy<T, K extends string, U = T>(this: Array<T>, keySelector: (value: T, index: number, initial: T[]) => K, valueSelector?: (value: T, index: number, initial: T[]) => U): { [P in K]: U[] | undefined } {
	return this
		.map((element, index, initial) => ({ key: keySelector(element, index, initial), value: (valueSelector || ((e, i, j) => e))(element, index, initial) }))
		.reduce((record, kv) => ({ ...(record as any), [kv.key]: (record[kv.key] || []).concat(kv.value as any) }), { } as { [P in K]: U[] | undefined });
		// K extends string due to https://github.com/Microsoft/TypeScript/issues/13042
		// (record as any) due to https://github.com/Microsoft/TypeScript/issues/14409
}
