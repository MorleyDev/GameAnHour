export function pipe<T, U>(this: T, mapper: (self: T) => U): U {
	return mapper.call(this, this);
}
