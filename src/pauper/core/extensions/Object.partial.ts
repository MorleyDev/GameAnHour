declare interface Object {
	partial<T1, U>(this: (v1: T1) => U, v1: T1): () => U;
	partial<T1, T2, U>(this: (v1: T1, v2: T2) => U, v1: T1): (v2: T2) => U;
	partial<T1, T2, U>(this: (v1: T1, v2: T2) => U, v1: T1, v2: T2): () => U;

	partial<T1, T2, T3, U>(this: (v1: T1, v2: T2, v3: T3) => U, v1: T1): (v3: T3, v2: T2) => U;
	partial<T1, T2, T3, U>(this: (v1: T1, v2: T2, v3: T3) => U, v1: T1, v2: T2): (v3: T3) => U;
	partial<T1, T2, T3, U>(this: (v1: T1, v2: T2, v3: T3) => U, v1: T1, v2: T2, v3: T3): () => U;
}

Object.defineProperty(Object.prototype, "partial", {
	value: function <T, U>(this: Function, ...args: any[]) {
		return (rest: any[]) => this(...args, ...rest);
	}, enumerable: false
});
