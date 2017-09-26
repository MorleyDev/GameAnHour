import { mergeMap } from "./Array.mergeMap.func";

declare global {
	interface Array<T> {
		mergeMap<E>(mapper: (value: T, index: number, initial: Array<T>) => Array<E>): Array<E>;
	}
}

Object.defineProperty(Array.prototype, "mergeMap", {
	value: mergeMap,
	enumerable: false
});
