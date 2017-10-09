import { GenericAction } from "./generic.action";
import { KeyDownAction } from "./system-keydown.action";
import { KeyUpAction } from "./system-keyup.action";
import { TickAction } from "./system-tick.action";

export type SystemAction = KeyDownAction | KeyUpAction | TickAction;

export const SystemAction = {
	Tick: (action: GenericAction): action is TickAction => action.type === "@@TICK",
	KeyDown: (action: GenericAction): action is KeyDownAction => action.type === "SYS_KeyDownAction",
	KeyUp: (action: GenericAction): action is KeyDownAction => action.type === "SYS_KeyUpAction"
};
