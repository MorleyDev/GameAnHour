import * as React from "react";

import { Observable } from "rxjs/Observable";
import { map } from "rxjs/operators";
import { merge } from "rxjs/observable/merge";

export function connect<TProperties, T>(
	Inner: React.Component<T & TProperties, any> | ((props: T & TProperties) => JSX.Element),
	observables: ({[x in keyof T]: Observable<T[x]> }) | ((props: TProperties) => {[x in keyof T]: Observable<T[x]> }),
	defaults?: {[x in keyof T]: T[x]}
) {
	// Extracts the observable mappings from a function or individual
	const extractObservableMap = (props: TProperties): ReadonlyArray<{ key: keyof T; observable: Observable<T[keyof T]> }> => {
		const observableMap = typeof observables === "function" ? observables(props) : observables;
		const obervableStates = Object.keys(observableMap).map((key: string) => ({ key: key as keyof T, observable: observableMap[key as keyof T] }));
		return obervableStates;
	};

	// The wrapper class which manages mount/unmount and resubscribes to an observable if the property that drives it has changed
	class Wrapper extends React.Component<TProperties, Partial<T>> {
		public state: Readonly<Partial<T>> = (defaults || {}) as Readonly<Partial<T>>;

		public subscriptions = extractObservableMap(this.props)
			.map(o => ({
				key: o.key,
				sub: o.observable.subscribe(value => this.setState(state => ({ ...state as any, [o.key]: value })))
			}));

		public componentWillReceiveProps(props: TProperties) {
			if (typeof observables !== "function" || props === this.props) {
				return;
			}
			const newSubscriptions = observables(props);
			for (const key in newSubscriptions) {
				if ((props as any)[key] !== (this.props as any)[key]) { // The property changed
					const sub = this.subscriptions.find(s => s.key === key); // So we find the original subscription
					if (sub) {
						sub.sub.unsubscribe(); // And replace it with the new one
						sub.sub = newSubscriptions[key].subscribe(value => this.setState(state => ({ ...state as any, [key]: value })));
					}
				}
			}
		}

		public render() {
			return this.state != null && React.createElement(Inner as any, { ...(this.props as any), ...(this.state as any) });
		}

		public componentWillUnmount() {
			this.subscriptions.forEach(s => s.sub.unsubscribe());
			this.subscriptions = [];
		}
	}
	return (props: TProperties) => React.createElement(Wrapper, props);
}