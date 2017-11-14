import { Subscription } from "rxjs/Subscription";
import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";
import { IScheduler } from "rxjs/Scheduler";
import { async } from "rxjs/scheduler/async";

export function safeBufferTime(time: number, scheduler: IScheduler = async): <T>(observable: Observable<T>) => Observable<ReadonlyArray<T>> {
	return <T>(observable: Observable<T>) => Observable.create((observer: Observer<T>) => {
		return observable.subscribe(new SafeBufferTimeObserver(observer, time, scheduler));
	});
}

class SafeBufferTimeObserver {
	private buffer: any[] = [];
	private timeout: Subscription | null = null;

	constructor(private subject: Observer<any>, private time: number, private scheduler: IScheduler) {
	}

	public next(value: any): void {
		this.buffer.push(value);

		if (this.timeout == null) {
			this.timeout = this.scheduler.schedule(() => this.send(), this.time);
		}
	}

	public complete(): void {
		if (this.timeout != null) {
			this.timeout.unsubscribe();
		}
		this.send();
		this.subject.complete();
	}

	public error(err: Error): void {
		if (this.timeout != null) {
			this.timeout.unsubscribe();
		}

		this.subject.error(err);
	}

	private send(): void {
		this.subject.next(this.buffer.splice(0));
		this.timeout = null;
	}
}
