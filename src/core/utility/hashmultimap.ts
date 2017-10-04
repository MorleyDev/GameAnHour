import { fgroupBy } from "../extensions/Array.groupBy.func";
import { fmerge } from "../extensions/Array.merge.func";

interface IHashMultiMap<TKey extends string, TValue> {
	map<U>(mapper: (kv: [TKey, TValue]) => U): U[];
	filter<U>(predicate: (kv: [TKey, TValue]) => boolean): HashMultiMap<TKey, TValue>;

	append(key: TKey, value: TValue): HashMultiMap<TKey, TValue>;
	remove(key: TKey): HashMultiMap<TKey, TValue>;

	at(key: TKey): ReadonlyArray<TValue>;
}

class HashMultiMapInner<TKey extends string, TValue> implements IHashMultiMap<TKey, TValue> {
	constructor(public _inner: { [key: string]: ReadonlyArray<TValue> }) {
	}

	map<U>(mapper: (kv: [TKey, TValue]) => U): U[] {
		const mapped = Object.keys(this._inner)
			.map(k => [k, this._inner[k]])
			.map(([key, value]) => (value as ReadonlyArray<TValue>).map(value => mapper([key as TKey, value])));

		return fmerge(mapped);
	}

	filter<U>(predicate: (kv: [TKey, TValue]) => boolean): HashMultiMap<TKey, TValue> {
		const json: { [key: string]: TValue[] } = {};
		for (let key in this._inner) {
			const innerItems = [key as TKey, this._inner[key].filter(v => predicate([key as TKey, v]))];
			if (innerItems[1].length > 0) {
				json[key] = innerItems[1] as TValue[];
			}
		}
		return HashMultiMap(json) as HashMultiMap<TKey, TValue>;
	}

	append(key: TKey, value: TValue): HashMultiMap<TKey, TValue> {
		return HashMultiMap({
			...this._inner,
			[key]: (this._inner[key] || []).concat(value)
		});
	}

	remove(key: TKey): HashMultiMap<TKey, TValue> {
		const { [key]: omit, ...rest } = this._inner;
		return HashMultiMap(rest);
	}

	removeWhere(key: TKey, predicate: (value: TValue) => boolean): HashMultiMap<TKey, TValue> {
		const { [key]: omit, ...rest } = this._inner;
		const filtered = (omit as TValue[]).filter(predicate);
		if (filtered.length === 0) {
			return HashMultiMap(rest);
		} else {
			return HashMultiMap({ ...rest, [key]: filtered });
		}
	}

	at(key: TKey): ReadonlyArray<TValue> {
		return this._inner[key] || [];
	}
}

export interface HashMultiMap<TKey extends string, TValue> extends HashMultiMapInner<TKey, TValue> { };

export const HashMultiMap = Object.assign(
	<TKey extends string, TValue>(json: { [key: string]: ReadonlyArray<TValue> }): HashMultiMap<TKey, TValue> => new HashMultiMapInner<TKey, TValue>(json),
	{
		fromArray: <T, K extends string, U = T>(array: T[], keySelector: (value: T) => K, valueSelector?: (value: T) => U) => HashMultiMap(fgroupBy(array, keySelector, valueSelector) as { [key: string]: U[] }),
		fromBidirectPairs: <T, K extends string>(array: [T, T][], keySelector: (value: T) => K) => HashMultiMap(fgroupBy(array.concat(array.map(x => [x[1], x[0]] as [T, T])), k => keySelector(k[0]), k => k[1]) as { [key: string]: T[] })
	}
);
