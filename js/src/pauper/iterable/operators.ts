export function map<T, U>(mapper: (x: T, index: number) => U): (it: Iterable<T>) => Iterable<U> {
	return function * (iterable: Iterable<T>): Iterable<U> {
		let index = 0;
		for (const value of iterable) {
			yield mapper(value, index);
			index = index + 1;
		}
	};
}

export function filter<T>(predicate: (x: T, index: number) => boolean): (it: Iterable<T>) => Iterable<T> {
	return function * (iterable: Iterable<T>): Iterable<T> {
		let index = 0;
		for (const value of iterable) {
			if (predicate(value, index)) {
				yield value;
			}
			index = index + 1;
		}
	};
}

export function reduce<T, U>(predicate: (prev: U, next: T, index: number) => U, initial: U): (it: Iterable<T>) => U {
	return function (iterable: Iterable<T>): U {
		let index = 0;
		let prevState = initial;
		for (const value of iterable) {
			prevState = predicate(prevState, value, index);
			index = index + 1;
		}
		return prevState;
	};
}

export function scan<T, U>(predicate: (prev: U, next: T, index: number) => U, initial: U): (it: Iterable<T>) => Iterable<U> {
	return function * (iterable: Iterable<T>): Iterable<U> {
		let index = 0;
		let prevState = initial;
		for (const value of iterable) {
			prevState = predicate(prevState, value, index);
			yield prevState;
			index = index + 1;
		}
		return prevState;
	};
}
