export function fcall<T, U>(self: T, mapper: (...extra: any[]) => U, ...extra: any[]): U {
	return mapper.call(self, ...extra);
}
