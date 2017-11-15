import { Observable } from "rxjs/Observable";
import { using } from "rxjs/observable/using";

import { isBrowser } from "./utility/is-browser";
import { isProduction } from "./utility/is-production";

export const stats: { [key: string]: { count: number; max: number; min: number; total: number } } = {};
if (isBrowser) {
	(window as any).stats = stats;
}

const now = typeof performance !== "undefined" ? () => performance.now() : () => Date.now();

export const profile = isProduction
	? <T>(name: string, func: () => T) => func()
	: <T>(name: string, func: () => T) => {
		const startTime = now();
		const result = func();
		const takenTime = (now() - startTime) / 1000;
		const prevStats = stats[name] || { count: 0, max: takenTime, min: takenTime, total: 0 };
		stats[name] = {
			count: prevStats.count + 1,
			max: Math.max(prevStats.max, takenTime),
			min: Math.min(prevStats.min, takenTime),
			total: takenTime + prevStats.total
		};
		return result;
	};

export const profile$ = (name: string): <T>(observable: Observable<T>) => Observable<T> =>
	isProduction
		? o$ => o$
		: o$ => using(() => {
			const startTime = now();

			return {
				unsubscribe() {
					const takenTime = now() - startTime;
					const prevStats = stats[name] || { count: 0, max: takenTime, min: takenTime, total: 0 };
					stats[name] = {
						count: prevStats.count + 1,
						max: Math.max(prevStats.max, takenTime),
						min: Math.min(prevStats.min, takenTime),
						total: takenTime + prevStats.total
					};
				}
			};
		}, () => o$);

export function statDump(name: string): void {
	const totalTime = Object.keys(stats)
		.reduce((prev, statKey) => {
			const stat = stats[statKey];
			const averageTime = stat.total / stat.count;
			return prev + averageTime;
		}, 0);
	Object.keys(stats)
		.sort()
		.forEach(statKey => {
			const stat = stats[statKey];
			const averageTime = stat.total / stat.count;
			console.log(`${name}#${statKey} | ${averageTime} | ~${((averageTime / totalTime) * 100) | 0}% | (${stat.min} - ${stat.max}) | x${stat.count}`);
		});
}
