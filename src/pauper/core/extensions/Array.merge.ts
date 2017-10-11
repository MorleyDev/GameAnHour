import { merge } from "./Array.merge.func";

declare global {
	interface ReadonlyArray<T> {
		merge<U>(this: ReadonlyArray<ReadonlyArray<U>>): U[];
	}
	interface Array<T> {
		merge<U>(this: ReadonlyArray<ReadonlyArray<U>>): U[];
	}
}

Object.defineProperty(Array.prototype, "merge", { value: merge, enumerable: false });
