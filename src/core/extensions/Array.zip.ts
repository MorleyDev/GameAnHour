import { zip } from "./Array.zip.func";

declare global {
	interface Array<T> {
		zip<K>(other: Array<K>): [T, K][];
	}
	interface ReadonlyArray<T> {
		zip<K>(other: ReadonlyArray<K>): [T, K][];
	}
}

Object.defineProperty(Array.prototype, "zip", { value: zip, enumerable: false });
