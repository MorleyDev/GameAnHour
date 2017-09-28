export const _ = Symbol();

export function match<T, U, V extends T>(target: T, patterns: [T | typeof _ | ((check: T) => check is V), (t: T) => U][]): U {
	for (let pattern of patterns) {
		const matcher = pattern[0];
		if (matcher === target || matcher === _ || (typeof matcher === "function" && matcher(target))) {
			return pattern[1](target);
		}
	}
	throw new Error("Unmatched pattern");
}
