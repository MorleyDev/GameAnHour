import { fmerge } from "../extensions/Array.merge.func";

interface IHashMap<TKey extends string, TValue> {
	map<U>(mapper: (kv: [TKey, TValue]) => U): U[];
	mergeMap<U>(mapper: (kv: [TKey, TValue]) => ReadonlyArray<U>): U[];
	filter(mapper: (kv: [TKey, TValue]) => boolean): IHashMap<TKey, TValue>;
	forEach(mapper: (kv: [TKey, TValue]) => void): void;

	hmap<UKey extends string, UValue>(mapper: (kv: [TKey, TValue]) => [UKey, UValue]): HashMap<UKey, UValue>;
	union(rhs: HashMap<TKey, TValue>): HashMap<TKey, TValue>;

	append(key: TKey, value: TValue): HashMap<TKey, TValue>;
	update(key: TKey, map: (value: TValue) => TValue): HashMap<TKey, TValue>;
	updateWhere(predicate: (kv: [TKey, TValue]) => boolean, map: (keyValue: [TKey, TValue]) => TValue): HashMap<TKey, TValue>
	remove(key: TKey): HashMap<TKey, TValue>;

	at(key: TKey): TValue | undefined;
}

class HashMapInner<TKey extends string, TValue> implements IHashMap<TKey, TValue> {
	private readonly _inner: Readonly<{ [key: string]: TValue }>;

	constructor(inner: { [key: string]: TValue }) {
		this._inner = inner;
	}

	map<U>(mapper: (kv: [TKey, TValue]) => U): U[] {
		return Object.keys(this._inner)
			.map(k => [k, this._inner[k]])
			.map(mapper);
	}

	mergeMap<U>(mapper: (kv: [TKey, TValue]) => ReadonlyArray<U>): U[] {
		return fmerge(
			Object.keys(this._inner)
				.map(k => [k, this._inner[k]])
				.map(mapper)
		);
	}

	hmap<UKey extends string, UValue>(mapper: (kv: [TKey, TValue]) => [UKey, UValue]): HashMap<UKey, UValue> {
		const json: { [key: string]: UValue } = {};
		for (let key in this._inner) {
			const kv = mapper([key as TKey, this._inner[key]]);
			json[kv[0]] = kv[1];
		}
		return HashMap(json) as HashMap<UKey, UValue>;
	}

	filter(predicate: (kv: [TKey, TValue]) => boolean): HashMap<TKey, TValue> {
		const json: { [key: string]: TValue } = {};
		for (let key in this._inner) {
			if (predicate([key as TKey, this._inner[key]])) {
				json[key] = this._inner[key];
			}
		}
		return HashMap(json) as HashMap<TKey, TValue>;
	}

	forEach(invoke: (kv: [TKey, TValue]) => void): void {
		for (let key in this._inner) {
			invoke([key as TKey, this._inner[key]]);
		}
	}

	append(key: TKey, value: TValue): HashMap<TKey, TValue> {
		return HashMap({ ...this._inner, [key]: value }) as HashMap<TKey, TValue>;
	}

	at(key: TKey): TValue | undefined {
		return this._inner[key];
	}

	remove(key: TKey): HashMap<TKey, TValue> {
		const { [key]: omit, ...rest } = this._inner;
		return  HashMap(rest) as HashMap<TKey, TValue>;
	}

	update(key: TKey, map: (value: TValue) => TValue): HashMap<TKey, TValue> {
		return HashMap({ ...this._inner, [key]: map(this._inner[key])  });
	}

	updateWhere(predicate: (kv: [TKey, TValue]) => boolean, map: (keyValue: [TKey, TValue]) => TValue): HashMap<TKey, TValue> {
		const json: { [key: string]: TValue } = {};
		for (let key in this._inner) {
			const keyValue: [TKey, TValue] = [key as TKey, this._inner[key]];
			json[key] = predicate(keyValue) ? map(keyValue) : this._inner[key];
		}
		return HashMap(json) as HashMap<TKey, TValue>;
	}

	union(rhs: HashMap<TKey, TValue>): HashMap<TKey, TValue> {
		return HashMap({
			...this._inner,
			...rhs._inner
		});
	}
}

export interface HashMap<TKey extends string, TValue> extends HashMapInner<TKey, TValue> { };

export const HashMap = Object.assign(
	<TKey extends string, TValue>(json: { [key: string]: TValue }): HashMap<TKey, TValue> => new HashMapInner<TKey, TValue>(json),
	{
		fromArray: <K extends string, T, U = T>(array: T[], keySelector: (value: T) => K, valueSelector: (value: T) => U): HashMap<K, U> => HashMap(array.reduce((prev, curr) => ({ ...prev, [keySelector(curr) as string]: valueSelector(curr) }), {}))
	}
);
