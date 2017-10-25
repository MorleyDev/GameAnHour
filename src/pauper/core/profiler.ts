import { Observable } from "rxjs/Observable";
import { using } from "rxjs/observable/using";

import { isBrowser } from "./utility/is-browser";
import { isProduction } from "./utility/is-production";

const stats: { [key: string]: { count: number; max: number; min: number; total: number } } = {};
if (isBrowser) {
	(window as any).stats = stats;
}

export const profile = isProduction
	? <T>(name: string, func: () => T) => func()
	: <T>(name: string, func: () => T) => {
		const startTime = Date.now();
		const result = func();
		const takenTime = Date.now() - startTime;
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
			const startTime = Date.now();

			return {
				unsubscribe() {
					const takenTime = Date.now() - startTime;
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
