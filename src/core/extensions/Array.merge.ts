import { merge } from "./Array.merge.func";

declare global {
	interface Array<T> {
		merge<U>(this: Array<U[]>): Array<U>;
	}
}

Object.defineProperty(Array.prototype, "merge", {
	value: merge,
	enumerable: false
});
