import { fmerge } from "../extensions/Array.merge.func";
import { Map, Collection, List, Set } from "immutable";

interface IHashMap<TKey extends string, TValue> {
	map<U>(mapper: (kv: [TKey, TValue]) => U): List<U>;
	mergeMap<U>(mapper: (kv: [TKey, TValue]) => ReadonlyArray<U>): List<U>;
	filter(mapper: (kv: [TKey, TValue]) => boolean): HashMap<TKey, TValue>;
	forEach(mapper: (kv: [TKey, TValue]) => void): void;

	hmap<UKey extends string, UValue>(mapper: (kv: [TKey, TValue]) => [UKey, UValue]): HashMap<UKey, UValue>;
	union(rhs: HashMap<TKey, TValue>): HashMap<TKey, TValue>;

	append(key: TKey, value: TValue): HashMap<TKey, TValue>;
	update(key: TKey, map: (value: TValue) => TValue): HashMap<TKey, TValue>;
	remove(key: TKey): HashMap<TKey, TValue>;

	at(key: TKey): TValue | undefined;
	subset(keys: ReadonlyArray<TKey>): HashMap<TKey, TValue>;

	values(): IterableIterator<TValue>;
}

class HashMapInner<TKey extends string, TValue> implements IHashMap<TKey, TValue> {
	constructor(public _inner: Map<TKey, TValue>) {
	}

	map<U>(mapper: (kv: [TKey, TValue]) => U): List<U> {
		return this._inner.map((value, key) => mapper([key, value])).toList();
	}

	mergeMap<U>(mapper: (kv: [TKey, TValue]) => ReadonlyArray<U>): List<U> {
		return this._inner.map((value, key) => mapper([key, value])).flatten(true).toList();
	}

	hmap<UKey extends string, UValue>(mapper: (kv: [TKey, TValue]) => [UKey, UValue]): HashMap<UKey, UValue> {
		return new HashMapInner(this._inner.mapEntries(mapper));
	}

	filter(predicate: (kv: [TKey, TValue]) => boolean): HashMap<TKey, TValue> {
		return new HashMapInner(this._inner.filter((value, key) => predicate([key, value])));
	}

	subset(keys: Iterable<TKey>): HashMap<TKey, TValue> {
		const keySet = Set(keys);
		return new HashMapInner(this._inner.filter((v: TValue, k: TKey) => keySet.has(k)));
	}

	forEach(invoke: (kv: [TKey, TValue], index: number) => void): void {
		let i = 0;
		this._inner.forEach((value, key) => invoke([key, value], i++));
	}

	append(key: TKey, value: TValue): HashMap<TKey, TValue> {
		return new HashMapInner(this._inner.set(key, value));
	}

	at(key: TKey): TValue | undefined {
		return this._inner.get(key);
	}

	remove(key: TKey): HashMap<TKey, TValue> {
		return new HashMapInner(this._inner.delete(key));
	}

	update(key: TKey, map: (value: TValue) => TValue): HashMap<TKey, TValue> {
		return new HashMapInner(this._inner.update(key, map));
	}

	union(rhs: HashMap<TKey, TValue>): HashMap<TKey, TValue> {
		return new HashMapInner(this._inner.merge(rhs._inner));
	}

	values(): IterableIterator<TValue> {
		return this._inner.values();
	}

	toMap(): Map<TKey, TValue> {
		return this._inner;
	}
}

export interface HashMap<TKey extends string, TValue> extends HashMapInner<TKey, TValue> { }

export const HashMap = Object.assign(
	<TKey extends string, TValue>(json?: Map<TKey, TValue>): HashMap<TKey, TValue> => new HashMapInner<TKey, TValue>(json ? Map(json) : Map()),
	{
		fromMap: <K extends string, T>(map: Map<K, T>) => new HashMapInner<K, T>(map),
		fromArray: <K extends string, T>(array: [K, T][]) => new HashMapInner<K, T>(Map(array))
	}
);
