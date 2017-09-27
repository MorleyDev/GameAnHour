import { pipe } from "./Object.pipe.func";

declare global {
	interface Object {
		pipe<T, U>(this: T, mapper: (self: T) => U): U;
	}
} 

Object.defineProperty(Object.prototype, "pipe", {
	value: pipe, enumerable: false
});
