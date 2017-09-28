export const _ = Symbol();

export function match<T, U, V>(target: T, patterns: [T | typeof _ | ((check: T) => boolean), (t: V) => U][]): U {
	for (let pattern of patterns) {
		const matcher = pattern[0];
		if (matcher === target || matcher === _ || (typeof matcher === "function" && matcher(target))) {
			return pattern[1](target as any as V);
		}
	}
	throw new Error("Unmatched pattern");
}
