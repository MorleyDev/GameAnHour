export function zip<T, K>(this: ReadonlyArray<T>, rhs: ReadonlyArray<K>): [T, K][] {
	return fzip(this, rhs);
}

export function fzip<T, K>(self: ReadonlyArray<T>, rhs: ReadonlyArray<K>): [T, K][] {
	const output: [T, K][] = [];
	const length = Math.min(self.length, rhs.length);
	for (let i = 0; i < length; ++i) {
		output.push([self[i], rhs[i]]);
	}
	return output;
}
