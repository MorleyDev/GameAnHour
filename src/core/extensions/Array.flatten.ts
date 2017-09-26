import { flatten } from "./Array.flatten.func";

declare global {
	interface Array<T> {
		flatten<U>(this: Array<U[]>): Array<U>;
	}
}

Object.defineProperty(Array.prototype, "flatten", {
	value: flatten,
	enumerable: false
});
