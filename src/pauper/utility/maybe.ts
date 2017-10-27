export type Just<T> = { readonly type: "Just"; readonly value: T; };
export const Just = <T>(value: T): Just<T> => ({ type: "Just", value });

export type None = { readonly type: "None"; };
export const None = ({ type: "None" });

export type Maybe<T>
	= Just<T>
	| None;

export const hasValue = <T>(value: Maybe<T>): value is Just<T> => value.type === "Just";
export const match = <T, S, U>(maybe: Maybe<T>, just: (value: T) => S, none: () => U) => maybe.type === "Just" ? just(maybe.value) : none();
export const withDefault = <T>(maybe: Maybe<T>, def: () => T): T => maybe.type === "Just" ? maybe.value : def();
