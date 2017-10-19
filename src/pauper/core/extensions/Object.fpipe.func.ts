export function fpipe<T, U>(self: T, mapper: (self: T, ...extra: any[]) => U, ...extra: any[]): U {
	return mapper(self, ...extra);
}