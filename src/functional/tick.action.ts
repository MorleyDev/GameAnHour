import { Seconds } from "../core/models/time.model";

export type TickAction = {
	readonly type: "@@TICK";
	readonly deltaTime: Seconds;
};