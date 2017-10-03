export function groupBy<T, K extends string, U = T>(this: ReadonlyArray<T>, keySelector: (value: T, index: number, initial: ReadonlyArray<T>) => K, valueSelector?: (value: T, index: number, initial: ReadonlyArray<T>) => U): { [P in K]: U[] | undefined } {
	return fgroupBy(this, keySelector, valueSelector);
}

export function fgroupBy<T, K extends string, U = T>(self: ReadonlyArray<T>, keySelector: (value: T, index: number, initial: ReadonlyArray<T>) => K, valueSelector?: (value: T, index: number, initial: ReadonlyArray<T>) => U): { [P in K]: U[] | undefined } {
	return self
		.map((element, index, initial) => ({ key: keySelector(element, index, initial), value: (valueSelector || ((e, i, j) => e))(element, index, initial) }))
		.reduce((record, kv) => ({ ...(record as any), [kv.key]: (record[kv.key] || []).concat(kv.value as any) }), { } as { [P in K]: U[] | undefined });
		// K extends string due to https://github.com/Microsoft/TypeScript/issues/13042
		// (record as any) due to https://github.com/Microsoft/TypeScript/issues/14409
}
