import { GenericAction } from "./generic.action";
import { Seconds } from "../core/models/time.model";

export type TickAction = {
	readonly type: "@@TICK";
	readonly deltaTime: Seconds;
};
export const TickAction = Object.assign(
	(deltaTime: Seconds) => ({ type: "@@TICK", deltaTime }),
	{
		is: (action: GenericAction): action is TickAction => action.type === "@@TICK"
	}
);
