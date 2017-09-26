export function flatten<T>(this: Array<T[]>): T[] {
	return Array.prototype.concat([], ...this);
}
