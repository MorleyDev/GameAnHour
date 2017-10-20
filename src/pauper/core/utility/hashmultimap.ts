import { HashMap } from "./hashmap";
import { fgroupBy } from "../extensions/Array.groupBy.func";
import { fmerge } from "../extensions/Array.merge.func";
import { List, Map, Set } from "immutable";

interface IHashMultiMap<TKey extends string, TValue> {
	map<U>(mapper: (kv: [TKey, TValue]) => U): List<U>;
	groupMap<TResult>(mapper: (kv: [TKey, Iterable<TValue>]) => TResult): List<TResult>;

	filter<U>(predicate: (kv: [TKey, TValue]) => boolean): HashMultiMap<TKey, TValue>;
	subset(keys: Iterable<TKey>): HashMultiMap<TKey, TValue>;

	append(key: TKey, value: TValue): HashMultiMap<TKey, TValue>;
	appendMap(map: HashMap<TKey, TValue>): HashMultiMap<TKey, TValue>;
	remove(key: TKey): HashMultiMap<TKey, TValue>;

	at(key: TKey): List<TValue>;
}

class HashMultiMapInner<TKey extends string, TValue> implements IHashMultiMap<TKey, TValue> {
	private readonly _inner: Map<TKey, List<TValue>>;

	constructor(inner: Map<TKey, List<TValue>>) {
		this._inner = inner || Map<TKey, List<TValue>>();
	}

	map<U>(mapper: (kv: [TKey, TValue]) => U): List<U> {
		return this._inner
			.map((value, key) => value.map((value) => mapper([key, value])))
			.toList()
			.flatMap(values => values);
	}

	groupMap<TResult>(mapper: (kv: [TKey, Iterable<TValue>]) => TResult): List<TResult> {
		return this._inner.map((value, key) => mapper([key, value])).toList();
	}

	filter<U>(predicate: (kv: [TKey, TValue]) => boolean): HashMultiMap<TKey, TValue> {
		return new HashMultiMapInner(
			this._inner.map((value, key) => value.filter(value => predicate([key, value])))
		);
	}

	subset(keys: Iterable<TKey>): HashMultiMap<TKey, TValue> {
		const keySet = Set(keys);
		return new HashMultiMapInner(this._inner.filter((v: List<TValue>, k: TKey) => keySet.has(k)));
	}

	append(key: TKey, value: TValue): HashMultiMap<TKey, TValue> {
		return new HashMultiMapInner(
			this._inner.update(key, List<TValue>([value]), list => list.push(value))
		);
	}

	appendMap(map: HashMap<TKey, TValue>): HashMultiMap<TKey, TValue> {
		return new HashMultiMapInner(
			map._inner.reduce((prev, value, key) => prev.update(key, List<TValue>([value]), list => list.push(value)), this._inner)
		);
	}


	concat(set: HashMultiMap<TKey, TValue>): HashMultiMap<TKey, TValue> {
		return new HashMultiMapInner(
			set._inner.reduce((prev, value, key) => prev.update(key, value, list => list.concat(value)), this._inner)
		);
	}

	remove(key: TKey): HashMultiMap<TKey, TValue> {
		return new HashMultiMapInner(this._inner.delete(key));
	}

	removeWhere(key: TKey, predicate: (value: TValue) => boolean): HashMultiMap<TKey, TValue> {
		return new HashMultiMapInner(this._inner.update(key, value => value.filter(v => !predicate(v))));
	}

	at(key: TKey): List<TValue> {
		return this._inner.get(key) || List<TValue>();
	}
}

export interface HashMultiMap<TKey extends string, TValue> extends HashMultiMapInner<TKey, TValue> { }

export const HashMultiMap = Object.assign(
	<TKey extends string, TValue>(map: Map<TKey, List<TValue>> = Map<TKey, List<TValue>>()): HashMultiMap<TKey, TValue> => new HashMultiMapInner(Map<TKey, List<TValue>>()),
	{
		fromJson: <TKey extends string, TValue>(json?: { [key: string]: ReadonlyArray<TValue> }): HashMultiMap<TKey, TValue> => new HashMultiMapInner<TKey, TValue>(
			json != null
				? Map(Object.keys(json).map(key => [key, List(json[key])] as [TKey, List<TValue>]))
				: Map<TKey, List<TValue>>()
		),
		fromArray: <T, K extends string, U = T>(array: T[], keySelector: (value: T) => K, valueSelector?: (value: T) => U): HashMultiMap<K, U> => HashMultiMap.fromJson(fgroupBy(array, keySelector, valueSelector) as { [key: string]: U[] }),
		fromBidirectPairs: <T, K extends string>(array: [T, T][], keySelector: (value: T) => K): HashMultiMap<K, T> => HashMultiMap.fromJson(fgroupBy(array.concat(array.map(flip)), k => keySelector(k[0]), k => k[1]) as { [key: string]: T[] })
	}
);

const flip = <T, U>([a, b]: [T, U]): [U, T] => [b, a];
