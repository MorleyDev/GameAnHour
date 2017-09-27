export function zip<T, K>(this: T[], rhs: K[]): [T, K][] {
	const output: [T, K][] = [];
	const length = Math.min(this.length, rhs.length);
	for (let i = 0; i < length; ++i) {
		output.push([this[i], rhs[i]]);
	}
	return output;
}
