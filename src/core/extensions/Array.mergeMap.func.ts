export function mergeMap<T, U>(this: T[], mapper: (value: T, index: number, initial: T[]) => U[]): U[] {
	return this.reduce((ys, curr, index, initial) => ys.concat(mapper(curr, index, initial)), [] as U[]);
}
