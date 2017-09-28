export function fpipe<T, U>(this: T, mapper: (...extra: any[]) => U, ...extra: any[]): U {
	return mapper.call(this, ...extra);
}
