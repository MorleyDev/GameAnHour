export const _ = Symbol();

type Pattern<T, V extends T = T> = T | typeof _ | ((check: T) => check is V) | ((check: T) => boolean);

type PatternSet<T, U,  V extends T = T> =
	[T, (t: T) => U]
	| [typeof _, (t: T) => U]
	| [(t: T) => t is V, (v: V) => U]
	| [(t: T) => boolean, (t: T) => U];

export function match<T, U, V extends T = T>(target: T, patterns: PatternSet<T, U, V>[]): U {
	for (let pattern of patterns) {
		const matcher = pattern[0];
		if (matcher === target || matcher === _ || (typeof matcher === "function" && matcher(target))) {
			const handler: (t: T | V) => U = pattern[1];
			return handler(target);
		}
	}
	throw new Error("Unmatched pattern");
}
