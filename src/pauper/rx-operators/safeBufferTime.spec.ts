import { IScheduler } from "rxjs/Scheduler";
import { Subject } from "rxjs/Subject";
import { test } from "tap";
import { Action } from "rxjs/scheduler/Action";
import { safeBufferTime } from "./safeBufferTime";
import { takeUntil } from "rxjs/operators";

test("safeBufferTime :: (Number, IScheduler) -> Observable T -> Observable T[]", test => {
	const scheduledActions: (<T>(this: Action<T>, state?: T) => void)[] = [];
	const scheduledDelays: (number | undefined)[] = [];
	const results: ReadonlyArray<string | number>[] = [];

	const subject = new Subject<number | string>();
	const complete = new Subject<{}>();
	const mockScheduler: IScheduler = {
		schedule: <T>(work: (this: any, state?: T) => void, delay?: number, state?: T) => {
			scheduledActions.push(work as any);
			scheduledDelays.push(delay);
			return {
				unsubscribe() { this.closed = true; },
				closed: false
			} as any;
		},
		now: (): number => { throw new Error(""); }
	};

	let _completed = false;
	let _errored: Error | null = null;
	let _addedExtra = false;
	const subscription = subject
		.pipe(
			takeUntil(complete),
			safeBufferTime(100, mockScheduler)
	)
		.subscribe(result => {
			results.push(result);

			if (!_addedExtra) {
				subject.next("Within");
				_addedExtra = true;
			}
		}, err => { _errored = err; }, () => { _completed = true; });

	subject.next(1);
	subject.next(2);
	subject.next(3);
	test.deepEqual(scheduledDelays, [100]);
	test.equal(scheduledActions.length, 1);

	scheduledActions[0].call(null);
	test.deepEqual(results, [[1, 2, 3]]);

	subject.next(4);
	subject.next(5);
	subject.next(6);
	test.deepEqual(scheduledDelays, [100, 100]);
	test.equal(scheduledActions.length, 2);

	scheduledActions[1].call(null);

	test.deepEqual(results, [[1, 2, 3], ["Within", 4, 5, 6]]);

	subject.next(7);
	subject.next(8);
	complete.next({});

	subscription.unsubscribe();

	test.true(_completed);
	test.is(_errored, null);

	test.deepEqual(results, [[1, 2, 3], ["Within", 4, 5, 6], [7, 8]]);
	test.end();
});
