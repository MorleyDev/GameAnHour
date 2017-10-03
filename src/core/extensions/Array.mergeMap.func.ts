export function mergeMap<T, U>(this: ReadonlyArray<T>, mapper: (value: T, index: number, initial: ReadonlyArray<T>) => ReadonlyArray<U>): U[] {
	return fmergeMap(this, mapper);
}

export function fmergeMap<T, U>(self: ReadonlyArray<T>, mapper: (value: T, index: number, initial: ReadonlyArray<T>) => ReadonlyArray<U>): U[] {
	return self.reduce((ys, curr, index, initial) => ys.concat(mapper(curr, index, initial) as U[]), [] as U[]);
}
