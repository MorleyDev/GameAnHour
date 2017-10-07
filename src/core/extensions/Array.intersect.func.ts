export function intersect<T>(...other: ReadonlyArray<T>[]): ReadonlyArray<T> {
	return other.length === 1
		? other[0]
		: Array.from(intersectSets(...other.map(x => new Set(x))));

	function intersectSets(...other: Set<T>[]): Set<T> {
		const [a, b, ...rest] = other;
		const set = new Set([...a].filter(x => b.has(x)));

		return (rest.length === 0)
			? set
			: intersectSets(set, ...rest);
	}
}
