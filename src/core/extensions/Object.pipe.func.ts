export function pipe<T, U>(this: T, mapper: (self: T, ...extra: any[]) => U, ...extra: any[]): U {
	return mapper.call(this, this, ...extra);
}
