import { fpipe } from "./Object.fpipe.func";

declare global {
	interface Object {
		fpipe<T, U>(this: T, mapper: (this: T) => U): U;
		fpipe<T, U, S1>(this: T, mapper: (this: T, s1: S1) => U, s1: S1): U;
		fpipe<T, U, S1, S2>(this: T, mapper: (this: T, s1: S1, s2: S2) => U, s1: S1, s2: S2): U;
	}
} 

Object.defineProperty(Object.prototype, "fpipe", {
	value: fpipe, enumerable: false
});
