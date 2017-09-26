export function groupBy(keySelector) {
	return this
		.map((element, index, initial) => ({ key: keySelector(element, index, initial), value: element }))
		.reduce((record, kv) => ({ ...record, [kv.key]: (record[kv.key] || []).concat(kv.value) }), { });
}
