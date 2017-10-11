import { fcall } from "./Object.fcall.func";

declare global {
	// Intended to be replacable by :: operator in future
	// https://github.com/tc39/proposal-bind-operator
	interface Object {
		fcall<U, T>(this: T, mapper: (this: T) => U): U;
		fcall<U, T, S1>(this: T, mapper: (this: T, s1: S1) => U, s1: S1): U;
		fcall<U, T, S1, S2>(this: T, mapper: (this: T, s1: S1, s2: S2) => U, s1: S1, s2: S2): U;

	}
}

Object.defineProperty(Object.prototype, "fcall", {
	value: function<T, U>(this: T, mapper: (...extra: any[]) => U, ...args: any[]) {
		return fcall(this, mapper, ...args);
	},
	enumerable: false
});
