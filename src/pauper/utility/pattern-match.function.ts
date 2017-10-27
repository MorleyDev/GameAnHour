export const _ = Symbol();

type Pattern<T> = T | typeof _ | ((check: T) => boolean);

type PatternSet<T, U> =
	[T, (t: T) => U]
	| [typeof _, (t: T) => U]
	| [(t: T) => boolean, (t: T) => U];

export function patternMatch<T, U>(target: T, ..._patterns: PatternSet<T, U>[]): U {
	for (const pattern of _patterns) {
		const matcher = pattern[0];
		if (matcher === target || matcher === _ || (typeof matcher === "function" && matcher(target))) {
			const handler: (t: T) => U = pattern[1];
			return handler(target);
		}
	}
	throw new Error("Unmatched pattern");
}
