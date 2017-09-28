import { pipe } from "./Object.pipe.func";

declare global {
	interface Object {
		pipe<T, U>(this: T, mapper: (this: T, self: T) => U): U;
		pipe<T, U, S1>(this: T, mapper: (this: T, self: T, s1: S1) => U, s1: S1): U;
		pipe<T, U, S1, S2>(this: T, mapper: (this: T, self: T, s1: S1, s2: S2) => U, s1: S1, s2: S2): U;
	}
} 

Object.defineProperty(Object.prototype, "pipe", {
	value: pipe, enumerable: false
});
