export function merge<T>(this: ReadonlyArray<ReadonlyArray<T>>): T[] {
	return fmerge(this);
}

export function fmerge<T>(self: ReadonlyArray<ReadonlyArray<T>>): T[] {
	return Array.prototype.concat([], ...self);
}
