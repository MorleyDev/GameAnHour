export function* range(start: number, count: number): Iterable<number> {
	for (let i = 0; i < count; ++i) {
		yield start + i;
	}
}

export function* infinite(): Iterable<number> {
	for (let i = 0; ; ++i) {
		yield i;
	}
}

export function* empty(): Iterable<any> { }

export function* concat<T>(...iterables: Iterable<T>[]): Iterable<T> {
	for (const iterable of iterables) {
		yield* iterable;
	}
}

export function* keys<T>(item: T): Iterable<string> {
	for (const key in item) {
		yield key;
	}
}
