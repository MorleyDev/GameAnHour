const enum MaybeType { Just, None }

export type Just<T> = { readonly type: MaybeType.Just; readonly value: T };
export const Just = <T>(value: T): Just<T> => ({ type: MaybeType.Just, value });

export type None = { readonly type: MaybeType.None };
export const None = ({ type: MaybeType.None });

export type Maybe<T>
	= Just<T>
	| None;

export const hasValue = <T>(maybe: Maybe<T>): maybe is Just<T> => maybe.type === MaybeType.Just;
export const match = <T, S, U>(maybe: Maybe<T>, just: (value: T) => S, none: () => U) => hasValue(maybe) ? just(maybe.value) : none();
export const withDefault = <T>(maybe: Maybe<T>, def: () => T): T => hasValue(maybe) ? maybe.value : def();
export const toArray = <T>(maybe: Maybe<T>): ReadonlyArray<T> => hasValue(maybe) ? [maybe.value] : [];

export function* toIterable<T>(maybe: Maybe<T>): Iterable<T> {
	if (hasValue(maybe)) {
		yield maybe.value;
	}
}

export function map<T, U>(mapper: (x: T) => U): (maybe: Maybe<T>) => Maybe<U> {
	return maybe => hasValue(maybe) ? Just(mapper(maybe.value)) : None as Maybe<U>;
}

export function filter<T>(predicate: (x: T) => boolean): (maybe: Maybe<T>) => Maybe<T> {
	return maybe => hasValue(maybe) && predicate(maybe.value) ? maybe : None as Maybe<T>;
}

export function flatMap<T, U>(mapper: (x: T) => Maybe<U>): (maybe: Maybe<T>) => Maybe<U> {
	return maybe => hasValue(maybe) ? mapper(maybe.value) : None as Maybe<U>;
}
