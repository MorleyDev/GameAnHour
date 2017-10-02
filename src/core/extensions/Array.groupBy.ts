import { groupBy } from "./Array.groupBy.func";

declare global {
	interface Array<T> {
		groupBy<K extends number>(keySelector: (value: T, index: number, initial: Array<T>) => K): { [P: number]: T[] | undefined };
		groupBy<K extends string>(keySelector: (value: T, index: number, initial: Array<T>) => K): { [P in K]: T[] | undefined };

		groupBy<K extends number, V>(keySelector: (value: T, index: number, initial: Array<T>) => K, valueSelector: (value: T, index: number, initial: Array<T>) => V): { [P: number]: V[] | undefined };
		groupBy<K extends string, V>(keySelector: (value: T, index: number, initial: Array<T>) => K, valueSelector: (value: T, index: number, initial: Array<T>) => V): { [P in K]: V[] | undefined };
	}
	interface ReadonlyArray<T> {
		groupBy<K extends number>(keySelector: (value: T, index: number, initial: Array<T>) => K): { [P: number]: T[] | undefined };
		groupBy<K extends string>(keySelector: (value: T, index: number, initial: Array<T>) => K): { [P in K]: T[] | undefined };

		groupBy<K extends number, V>(keySelector: (value: T, index: number, initial: Array<T>) => K, valueSelector: (value: T, index: number, initial: Array<T>) => V): { [P: number]: V[] | undefined };
		groupBy<K extends string, V>(keySelector: (value: T, index: number, initial: Array<T>) => K, valueSelector: (value: T, index: number, initial: Array<T>) => V): { [P in K]: V[] | undefined };
	}
}

Object.defineProperty(Array.prototype, "groupBy", {
	value: groupBy,
	enumerable: false
});
