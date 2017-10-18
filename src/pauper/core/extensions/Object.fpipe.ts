import { fpipe } from "./Object.fpipe.func";

declare global {
	// Intended to be replacable by |> operator in future
	// https://github.com/tc39/proposal-pipeline-operator

	interface Object {
		fpipe<T, U>(this: T, mapper: (this: T, self: T) => U): U;
		fpipe<T, U, S1>(this: T, mapper: (this: T, self: T, s1: S1) => U, s1: S1): U;
		fpipe<T, U, S1, S2>(this: T, mapper: (this: T, self: T, s1: S1, s2: S2) => U, s1: S1, s2: S2): U;
	}
};

Object.defineProperty(Object.prototype, "fpipe", {
	value: function<T, U>(this: T, mapper: (...extra: any[]) => U, ...args: any[]) {
		return fpipe(this, mapper, ...args);
	}, enumerable: false
});
