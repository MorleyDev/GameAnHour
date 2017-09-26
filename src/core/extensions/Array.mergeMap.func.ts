export function mergeMap<T, U>(this: T[], mapper: (t: T) => U[]): U[] {
	return this.reduce((ys, curr) => ys.concat(mapper(curr)), [] as U[]);
}
