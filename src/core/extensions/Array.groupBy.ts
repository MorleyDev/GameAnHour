import { groupBy } from "./Array.groupBy.func";

declare global {
	interface Array<T> {
		groupBy<K extends number>(keySelector: (value: T, index: number, initial: Array<T>) => K): { [P: number]: T[] | undefined };
		groupBy<K extends string>(keySelector: (value: T, index: number, initial: Array<T>) => K): { [P in K]: T[] | undefined };
	}
}

Object.defineProperty(Array.prototype, "groupBy", {
	value: groupBy,
	enumerable: false
});
