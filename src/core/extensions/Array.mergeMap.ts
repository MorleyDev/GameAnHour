import { mergeMap } from "./Array.mergeMap.func";

declare global {
	interface Array<T> {
		mergeMap<E>(callback: (t: T) => Array<E>): Array<E>;
	}
}

Object.defineProperty(Array.prototype, "mergeMap", {
	value: mergeMap,
	enumerable: false
});
