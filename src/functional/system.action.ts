import { GenericAction } from "./generic.action";
import { KeyUpAction } from "./system-keyup.action";
import { KeyDownAction } from "./system-keydown.action";

export type SystemAction = KeyDownAction | KeyUpAction;

export const SystemAction = {
	KeyDown: (action: GenericAction): action is KeyDownAction => action.type === "SYS_KeyDownAction",
	KeyUp: (action: GenericAction): action is KeyDownAction => action.type === "SYS_KeyUpAction"
};
