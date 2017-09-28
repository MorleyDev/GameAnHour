import { fpipe } from "./Object.fpipe.func";

declare global {
	// Intended to be replacable by :: operator in future
	// https://github.com/tc39/proposal-bind-operator
	interface Object {
		fpipe<U, T>(this: T, mapper: (this: T) => U): U;
		fpipe<U, T, S1>(this: T, mapper: (this: T, s1: S1) => U, s1: S1): U;
		fpipe<U, T, S1, S2>(this: T, mapper: (this: T, s1: S1, s2: S2) => U, s1: S1, s2: S2): U;

	}
}

Object.defineProperty(Object.prototype, "fpipe", {
	value: fpipe, enumerable: false
});
