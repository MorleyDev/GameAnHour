import { mergeMap } from "./Array.mergeMap.func";

declare global {
	interface ReadonlyArray<T> {
		mergeMap<E>(mapper: (value: T, index: number, initial: ReadonlyArray<T>) => ReadonlyArray<E>): E[];
	}
	interface Array<T> {
		mergeMap<E>(mapper: (value: T, index: number, initial: ReadonlyArray<T>) => ReadonlyArray<E>): E[];
	}
}

Object.defineProperty(Array.prototype, "mergeMap", {
	value: mergeMap,
	enumerable: false
});
