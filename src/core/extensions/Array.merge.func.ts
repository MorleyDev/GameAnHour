export function merge<T>(this: Array<T[]>): T[] {
	return Array.prototype.concat([], ...this);
}
